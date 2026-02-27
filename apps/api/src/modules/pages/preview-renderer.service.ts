import { Injectable } from '@nestjs/common';
import { canonicalPageHash } from './canonical-page-hash';
import { RENDERER_VERSION } from './renderer-version';
import { repairPayload } from '../ai/repair-pipeline';
import {
  previewRenderMode,
  validatePreviewEditorJson,
} from './preview-render-validator';

type JsonRecord = Record<string, unknown>;
type RenderNavLink = { label: string; targetSlug: string };
type LinkRenderMode = 'preview' | 'publish';

const IMAGE_PLACEHOLDER_SRC = 'https://placehold.co/1200x800?text=Image';

@Injectable()
export class PreviewRendererService {
  private readonly baseCss = `
.baw-page{--baw-color-primary:#111827;--baw-color-background:#ffffff;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--baw-color-primary);background:var(--baw-color-background);max-width:1200px;margin:0 auto;padding:24px;line-height:1.5}
.baw-nav{display:flex;gap:12px;padding:12px 0}
.baw-nav a{text-decoration:none}
.baw-section{margin:0 0 24px}
.baw-block{display:grid;gap:12px}
.baw-node-text{margin:0}
.baw-node-button{display:inline-block;padding:10px 16px;border-radius:8px;background:#111827;color:#ffffff;text-decoration:none;font-weight:600}
.baw-node-image{max-width:100%;height:auto;border-radius:8px;display:block}
`.trim();

  private asRecord(value: unknown): JsonRecord | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
      return null;
    return value as JsonRecord;
  }

  private asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private readString(value: unknown, fallback = ''): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return fallback;
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private readId(record: JsonRecord): string {
    return this.readString(record.id);
  }

  private normalizeSlug(slug: string): string {
    const trimmed = slug.trim();
    if (!trimmed || trimmed === '/') return '/';
    const noEdges = trimmed.replace(/^\/+/, '').replace(/\/+$/, '');
    if (!noEdges) return '/';
    return `/${noEdges}`;
  }

  private slugDepth(slug: string): number {
    const normalized = this.normalizeSlug(slug);
    if (normalized === '/') return 0;
    return normalized.slice(1).split('/').filter(Boolean).length;
  }

  private relPrefix(depth: number): string {
    if (depth <= 0) return '';
    return '../'.repeat(depth);
  }

  private toStaticHref(currentSlug: string, targetSlug: string): string {
    const depth = this.slugDepth(currentSlug);
    const prefix = this.relPrefix(depth);
    const normalizedTarget = this.normalizeSlug(targetSlug);
    if (normalizedTarget === '/') {
      return depth <= 0 ? '/' : prefix;
    }
    return `${prefix}${normalizedTarget.slice(1)}/`;
  }

  private isExternalHref(href: string): boolean {
    const value = href.trim().toLowerCase();
    return (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('mailto:') ||
      value.startsWith('tel:') ||
      value.startsWith('//')
    );
  }

  private buildPublishHref(fromPageSlug: string, toPageSlug: string): string {
    const fromNormalized = this.normalizeSlug(fromPageSlug);
    const toNormalized = this.normalizeSlug(toPageSlug);
    const prefix = this.relPrefix(this.slugDepth(fromNormalized));

    if (toNormalized === '/') {
      return `${prefix}index.html`;
    }

    return `${prefix}${toNormalized.slice(1)}/index.html`;
  }

  private extractPublishTarget(params: {
    rawHref: string;
  }): { toPageSlug: string; suffix: string } | null {
    const href = params.rawHref.trim();
    if (
      !href ||
      href.startsWith('#') ||
      this.isExternalHref(href) ||
      href.startsWith('./') ||
      href.startsWith('../')
    ) {
      return null;
    }

    const hashIndex = href.indexOf('#');
    const hashSuffix = hashIndex >= 0 ? href.slice(hashIndex) : '';
    const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
    const queryIndex = withoutHash.indexOf('?');
    const querySuffix = queryIndex >= 0 ? withoutHash.slice(queryIndex) : '';
    const pathOnly =
      queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;

    const withoutLeadingSlash = pathOnly.replace(/^\/+/, '');
    const withoutTrailingSlash = withoutLeadingSlash.replace(/\/+$/, '');
    const withoutIndex = withoutTrailingSlash
      .replace(/\/index\.html$/i, '')
      .replace(/^index\.html$/i, '');

    if (!withoutIndex || withoutIndex.toLowerCase() === 'home') {
      return { toPageSlug: '/', suffix: `${querySuffix}${hashSuffix}` };
    }

    if (!/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(withoutIndex)) {
      return null;
    }

    return {
      toPageSlug: `/${withoutIndex}`,
      suffix: `${querySuffix}${hashSuffix}`,
    };
  }

  private toPublishHref(fromPageSlug: string, rawHref: string): string {
    const target = this.extractPublishTarget({ rawHref });
    if (!target) return rawHref;
    return `${this.buildPublishHref(fromPageSlug, target.toPageSlug)}${target.suffix}`;
  }

  private resolveInternalHref(
    currentSlug: string,
    href: string,
    mode: LinkRenderMode,
  ): string {
    if (mode === 'publish') {
      return this.toPublishHref(currentSlug, href);
    }
    return this.toStaticHref(currentSlug, href);
  }

  private getTextTag(record: JsonRecord): 'h1' | 'h2' | 'p' {
    const explicitTag = this.readString(record.tag).toLowerCase();
    if (explicitTag === 'h1' || explicitTag === 'h2' || explicitTag === 'p')
      return explicitTag;

    const size = this.resolveFontSize(record);
    if (size >= 42) return 'h1';
    if (size >= 30) return 'h2';
    return 'p';
  }

  private resolveFontSize(record: JsonRecord): number {
    const direct = record.size;
    if (typeof direct === 'number') return direct;
    if (typeof direct === 'string') {
      const lower = direct.toLowerCase();
      if (
        lower === 'h1' ||
        lower === '3xl' ||
        lower === '4xl' ||
        lower === 'display'
      )
        return 48;
      if (lower === 'h2' || lower === '2xl' || lower === 'xl') return 32;
      const parsed = Number.parseFloat(lower);
      if (Number.isFinite(parsed)) return parsed;
    }

    const style = this.asRecord(record.style);
    const fontSize = style?.fontSize;
    if (typeof fontSize === 'number') return fontSize;
    if (typeof fontSize === 'string') {
      const parsed = Number.parseFloat(fontSize);
      if (Number.isFinite(parsed)) return parsed;
    }

    return 0;
  }

  private renderNode(
    node: unknown,
    assetUrlById: Record<string, string>,
    currentSlug: string,
    mode: LinkRenderMode,
  ): string {
    const record = this.asRecord(node);
    if (!record) return '<!-- Invalid node -->';

    const type = this.readString(record.type).toLowerCase();

    if (type === 'text') {
      const tag = this.getTextTag(record);
      const text = this.readString(
        record.content,
        this.readString(record.text, ''),
      );
      const id = this.readId(record);
      const idAttr = id ? ` id="${this.escapeHtml(id)}"` : '';
      return `<${tag} class="baw-node-text"${idAttr}>${this.escapeHtml(text)}</${tag}>`;
    }

    if (type === 'button') {
      const label = this.readString(
        record.label,
        this.readString(record.text, 'Button'),
      );
      const href =
        this.readString(record.href, this.readString(record.url, '#')) || '#';
      const resolvedHref =
        mode === 'publish' && !this.isExternalHref(href)
          ? this.resolveInternalHref(currentSlug, href, mode)
          : href.startsWith('/')
            ? this.resolveInternalHref(currentSlug, href, mode)
            : href;
      const id = this.readId(record);
      const idAttr = id ? ` id="${this.escapeHtml(id)}"` : '';
      return `<a class="baw-node-button"${idAttr} href="${this.escapeHtml(resolvedHref)}">${this.escapeHtml(label)}</a>`;
    }

    if (type === 'image') {
      const assetRef = this.readString(record.asset_ref, '');
      const resolvedFromAssetRef = assetRef
        ? this.readString(assetUrlById[assetRef], '')
        : '';
      const src = assetRef
        ? resolvedFromAssetRef || IMAGE_PLACEHOLDER_SRC
        : this.readString(record.src, this.readString(record.url, '')) ||
          IMAGE_PLACEHOLDER_SRC;
      const alt = this.readString(record.alt, 'Image');
      const id = this.readId(record);
      const idAttr = id ? ` id="${this.escapeHtml(id)}"` : '';
      return `<img class="baw-node-image"${idAttr} src="${this.escapeHtml(src)}" alt="${this.escapeHtml(alt)}" />`;
    }

    return `<!-- Unknown node type: ${this.escapeHtml(type || 'unknown')} -->`;
  }

  private renderBlock(
    block: unknown,
    assetUrlById: Record<string, string>,
    currentSlug: string,
    mode: LinkRenderMode,
  ): string {
    const record = this.asRecord(block);
    if (!record) return '<div class="baw-block"><!-- Invalid block --></div>';

    const blockId = this.readId(record);
    const nodes = this.asArray(record.nodes)
      .map((node) => this.renderNode(node, assetUrlById, currentSlug, mode))
      .join('');
    const attr = blockId
      ? ` data-block="${this.escapeHtml(blockId)}" id="${this.escapeHtml(blockId)}"`
      : '';
    return `<div class="baw-block"${attr}>${nodes}</div>`;
  }

  private renderSection(
    section: unknown,
    assetUrlById: Record<string, string>,
    currentSlug: string,
    mode: LinkRenderMode,
  ): string {
    const record = this.asRecord(section);
    if (!record)
      return '<section class="baw-section"><!-- Invalid section --></section>';

    const sectionId = this.readId(record);
    const blocks = this.asArray(record.blocks)
      .map((block) => this.renderBlock(block, assetUrlById, currentSlug, mode))
      .join('');
    const attr = sectionId
      ? ` data-section="${this.escapeHtml(sectionId)}" id="${this.escapeHtml(sectionId)}"`
      : '';
    return `<section class="baw-section"${attr}>${blocks}</section>`;
  }

  private renderNavigation(
    navLinks: RenderNavLink[],
    currentSlug: string,
    mode: LinkRenderMode,
  ): string {
    if (!Array.isArray(navLinks) || navLinks.length === 0) return '';

    const links = navLinks
      .filter(
        (item) =>
          item &&
          typeof item.label === 'string' &&
          typeof item.targetSlug === 'string',
      )
      .map((item) => {
        const normalizedTarget = this.normalizeSlug(item.targetSlug);
        const label = item.label.trim() || normalizedTarget;
        if (normalizedTarget === this.normalizeSlug(currentSlug)) {
          return `<span>${this.escapeHtml(label)}</span>`;
        }
        const href =
          mode === 'publish'
            ? this.buildPublishHref(currentSlug, normalizedTarget)
            : this.resolveInternalHref(currentSlug, normalizedTarget, mode);
        return `<a href="${this.escapeHtml(href)}">${this.escapeHtml(label)}</a>`;
      })
      .join('');

    if (!links) return '';
    return `<nav class="baw-nav">${links}</nav>`;
  }

  private renderSeoHeadTags(params: {
    seoJson: unknown;
    siteName?: string;
    pageTitle: string;
    faviconUrl?: string;
    defaultOgImageUrl?: string;
  }): string {
    const seo = this.asRecord(params.seoJson) ?? {};
    const fallbackTitle =
      this.readString(params.siteName).trim() ||
      params.pageTitle.trim() ||
      'Buildaweb Site';
    const title = this.readString(seo.title).trim() || fallbackTitle;
    const description = this.readString(seo.description).trim();
    const faviconUrl = this.readString(params.faviconUrl).trim();
    const defaultOgImageUrl = this.readString(params.defaultOgImageUrl).trim();

    const tags = [`<title>${this.escapeHtml(title)}</title>`];
    if (description) {
      tags.push(
        `<meta name="description" content="${this.escapeHtml(description)}" />`,
      );
    }
    if (faviconUrl) {
      tags.push(`<link rel="icon" href="${this.escapeHtml(faviconUrl)}" />`);
    }
    if (defaultOgImageUrl) {
      tags.push(
        `<meta property="og:image" content="${this.escapeHtml(defaultOgImageUrl)}" />`,
      );
    }
    return tags.join('\n');
  }

  private toCssProp(name: string): string | null {
    const allowed = new Set([
      'color',
      'backgroundColor',
      'fontSize',
      'fontWeight',
      'textAlign',
      'marginTop',
      'marginBottom',
      'paddingTop',
      'paddingBottom',
      'borderRadius',
    ]);
    if (!allowed.has(name)) return null;
    return name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  }

  private tokenVars(tokens: unknown): string[] {
    const out: string[] = [];
    const visit = (value: unknown, path: string[]) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return;
      const rec = value as Record<string, unknown>;
      for (const key of Object.keys(rec).sort((a, b) => a.localeCompare(b))) {
        const next = rec[key];
        const p = [...path, key.toLowerCase().replace(/[^a-z0-9_-]/g, '-')];
        if (typeof next === 'string' || typeof next === 'number') {
          out.push(`--baw-${p.join('-')}:${String(next)};`);
        } else {
          visit(next, p);
        }
      }
    };
    visit(tokens, []);
    return out;
  }

  private collectStyleRules(editorJson: unknown): string[] {
    const page = this.asRecord(editorJson) ?? {};
    const sections = this.asArray(page.sections);
    const rules: string[] = [];

    const apply = (id: string, style: unknown) => {
      const styleRec = this.asRecord(style);
      if (!id || !styleRec) return;
      const declarations = Object.keys(styleRec)
        .sort((a, b) => a.localeCompare(b))
        .map((key) => {
          const prop = this.toCssProp(key);
          if (!prop) return '';
          const value = styleRec[key];
          if (typeof value !== 'string' && typeof value !== 'number') return '';
          return `${prop}:${String(value)};`;
        })
        .filter(Boolean)
        .join('');
      if (declarations) {
        rules.push(`#${this.escapeHtml(id)}{${declarations}}`);
      }
    };

    for (const section of sections) {
      const sectionRecord = this.asRecord(section);
      if (!sectionRecord) continue;
      apply(this.readId(sectionRecord), sectionRecord.style);
      const blocks = this.asArray(sectionRecord.blocks);
      for (const block of blocks) {
        const blockRecord = this.asRecord(block);
        if (!blockRecord) continue;
        apply(this.readId(blockRecord), blockRecord.style);
        const nodes = this.asArray(blockRecord.nodes);
        for (const node of nodes) {
          const nodeRecord = this.asRecord(node);
          if (!nodeRecord) continue;
          apply(this.readId(nodeRecord), nodeRecord.style);
        }
      }
    }

    return rules;
  }

  private normalizeAndValidate(editorJson: unknown): unknown {
    const mode = previewRenderMode(process.env.PREVIEW_RENDER_VALIDATION_MODE);
    if (mode === 'repair') {
      const repaired = repairPayload(editorJson, { fillMissingIds: false });
      return validatePreviewEditorJson(repaired.repaired);
    }
    return validatePreviewEditorJson(editorJson);
  }

  render(params: {
    pageId: string;
    editorJson: unknown;
    assetUrlById?: Record<string, string>;
    navLinks?: RenderNavLink[];
    currentSlug?: string;
    pageTitle?: string;
    seoJson?: unknown;
    siteName?: string;
    faviconUrl?: string;
    defaultOgImageUrl?: string;
    locale?: string;
    linkMode?: LinkRenderMode;
  }) {
    const validatedEditorJson = this.normalizeAndValidate(params.editorJson);
    const pageRecord = this.asRecord(validatedEditorJson) ?? {};
    const assetUrlById = params.assetUrlById ?? {};
    const navLinks = params.navLinks ?? [];
    const currentSlug = this.normalizeSlug(params.currentSlug ?? '/');
    const linkMode = params.linkMode ?? 'preview';
    const pageTitle =
      this.readString(params.pageTitle, 'Buildaweb Site') || 'Buildaweb Site';
    const headTags = this.renderSeoHeadTags({
      seoJson: params.seoJson,
      siteName: params.siteName,
      pageTitle,
      faviconUrl: params.faviconUrl,
      defaultOgImageUrl: params.defaultOgImageUrl,
    });
    const langCandidate = this.readString(params.locale).trim() || 'en';
    const lang = /^[A-Za-z0-9-]+$/.test(langCandidate) ? langCandidate : 'en';
    const navHtml = this.renderNavigation(navLinks, currentSlug, linkMode);
    const sections = this.asArray(pageRecord.sections)
      .map((section) =>
        this.renderSection(section, assetUrlById, currentSlug, linkMode),
      )
      .join('');

    const html = `<div class="baw-page" data-page="${this.escapeHtml(params.pageId)}">${navHtml}${sections}</div>`;
    const tokenVars = this.tokenVars(pageRecord.tokens);
    const tokenCss = tokenVars.length ? `.baw-page{${tokenVars.join('')}}` : '';
    const scopedRules = this.collectStyleRules(pageRecord).join('');
    const css = [this.baseCss, tokenCss, scopedRules]
      .filter(Boolean)
      .join('\n');
    const hash = canonicalPageHash({
      tokensJson: {
        navLinks,
        currentSlug,
        css,
        headTags,
        lang,
        linkMode,
      },
      pageJson: pageRecord,
      rendererVersion: RENDERER_VERSION,
    });

    return { html, css, hash, headTags, lang };
  }
}
