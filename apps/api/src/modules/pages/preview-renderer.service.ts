import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

type JsonRecord = Record<string, unknown>;
type RenderNavLink = { label: string; targetSlug: string };

const IMAGE_PLACEHOLDER_SRC = 'https://placehold.co/1200x800?text=Image';

@Injectable()
export class PreviewRendererService {
  private readonly baseCss = `
.baw-page{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;background:#ffffff;max-width:1200px;margin:0 auto;padding:24px;line-height:1.5}
.baw-nav{display:flex;gap:12px;padding:12px 0}
.baw-nav a{text-decoration:none}
.baw-section{margin:0 0 24px}
.baw-block{display:grid;gap:12px}
.baw-node-text{margin:0}
.baw-node-button{display:inline-block;padding:10px 16px;border-radius:8px;background:#111827;color:#ffffff;text-decoration:none;font-weight:600}
.baw-node-image{max-width:100%;height:auto;border-radius:8px;display:block}
`.trim();

  private asRecord(value: unknown): JsonRecord | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
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

  private getTextTag(record: JsonRecord): 'h1' | 'h2' | 'p' {
    const explicitTag = this.readString(record.tag).toLowerCase();
    if (explicitTag === 'h1' || explicitTag === 'h2' || explicitTag === 'p') return explicitTag;

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
      if (lower === 'h1' || lower === '3xl' || lower === '4xl' || lower === 'display') return 48;
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

  private renderNode(node: unknown, assetUrlById: Record<string, string>, currentSlug: string): string {
    const record = this.asRecord(node);
    if (!record) return '<!-- Invalid node -->';

    const type = this.readString(record.type).toLowerCase();

    if (type === 'text') {
      const tag = this.getTextTag(record);
      const text = this.readString(record.content, this.readString(record.text, ''));
      return `<${tag} class="baw-node-text">${this.escapeHtml(text)}</${tag}>`;
    }

    if (type === 'button') {
      const label = this.readString(record.label, this.readString(record.text, 'Button'));
      const href = this.readString(record.href, this.readString(record.url, '#')) || '#';
      const resolvedHref = href.startsWith('/') ? this.toStaticHref(currentSlug, href) : href;
      return `<a class="baw-node-button" href="${this.escapeHtml(resolvedHref)}">${this.escapeHtml(label)}</a>`;
    }

    if (type === 'image') {
      const assetRef = this.readString(record.asset_ref, '');
      const resolvedFromAssetRef = assetRef ? this.readString(assetUrlById[assetRef], '') : '';
      const src = assetRef
        ? resolvedFromAssetRef || IMAGE_PLACEHOLDER_SRC
        : this.readString(record.src, this.readString(record.url, '')) || IMAGE_PLACEHOLDER_SRC;
      const alt = this.readString(record.alt, 'Image');
      return `<img class="baw-node-image" src="${this.escapeHtml(src)}" alt="${this.escapeHtml(alt)}" />`;
    }

    return `<!-- Unknown node type: ${this.escapeHtml(type || 'unknown')} -->`;
  }

  private renderBlock(block: unknown, assetUrlById: Record<string, string>, currentSlug: string): string {
    const record = this.asRecord(block);
    if (!record) return '<div class="baw-block"><!-- Invalid block --></div>';

    const blockId = this.readId(record);
    const nodes = this.asArray(record.nodes).map((node) => this.renderNode(node, assetUrlById, currentSlug)).join('');
    const attr = blockId ? ` data-block="${this.escapeHtml(blockId)}"` : '';
    return `<div class="baw-block"${attr}>${nodes}</div>`;
  }

  private renderSection(section: unknown, assetUrlById: Record<string, string>, currentSlug: string): string {
    const record = this.asRecord(section);
    if (!record) return '<section class="baw-section"><!-- Invalid section --></section>';

    const sectionId = this.readId(record);
    const blocks = this.asArray(record.blocks)
      .map((block) => this.renderBlock(block, assetUrlById, currentSlug))
      .join('');
    const attr = sectionId ? ` data-section="${this.escapeHtml(sectionId)}"` : '';
    return `<section class="baw-section"${attr}>${blocks}</section>`;
  }

  private stableStringify(value: unknown): string {
    const visit = (input: unknown): unknown => {
      if (Array.isArray(input)) return input.map((item) => visit(item));
      if (input && typeof input === 'object') {
        const record = input as Record<string, unknown>;
        const out: Record<string, unknown> = {};
        for (const key of Object.keys(record).sort()) {
          out[key] = visit(record[key]);
        }
        return out;
      }
      return input;
    };

    return JSON.stringify(visit(value));
  }

  private renderNavigation(navLinks: RenderNavLink[], currentSlug: string): string {
    if (!Array.isArray(navLinks) || navLinks.length === 0) return '';

    const links = navLinks
      .filter((item) => item && typeof item.label === 'string' && typeof item.targetSlug === 'string')
      .map((item) => {
        const normalizedTarget = this.normalizeSlug(item.targetSlug);
        const label = item.label.trim() || normalizedTarget;
        if (normalizedTarget === this.normalizeSlug(currentSlug)) {
          return `<span>${this.escapeHtml(label)}</span>`;
        }
        const href = this.toStaticHref(currentSlug, normalizedTarget);
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
    const fallbackTitle = this.readString(params.siteName).trim() || params.pageTitle.trim() || 'Buildaweb Site';
    const title = this.readString(seo.title).trim() || fallbackTitle;
    const description = this.readString(seo.description).trim();
    const faviconUrl = this.readString(params.faviconUrl).trim();
    const defaultOgImageUrl = this.readString(params.defaultOgImageUrl).trim();

    const tags = [`<title>${this.escapeHtml(title)}</title>`];
    if (description) {
      tags.push(`<meta name="description" content="${this.escapeHtml(description)}" />`);
    }
    if (faviconUrl) {
      tags.push(`<link rel="icon" href="${this.escapeHtml(faviconUrl)}" />`);
    }
    if (defaultOgImageUrl) {
      tags.push(`<meta property="og:image" content="${this.escapeHtml(defaultOgImageUrl)}" />`);
    }
    return tags.join('\n');
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
  }) {
    const pageRecord = this.asRecord(params.editorJson) ?? {};
    const assetUrlById = params.assetUrlById ?? {};
    const navLinks = params.navLinks ?? [];
    const currentSlug = this.normalizeSlug(params.currentSlug ?? '/');
    const pageTitle = this.readString(params.pageTitle, 'Buildaweb Site') || 'Buildaweb Site';
    const headTags = this.renderSeoHeadTags({
      seoJson: params.seoJson,
      siteName: params.siteName,
      pageTitle,
      faviconUrl: params.faviconUrl,
      defaultOgImageUrl: params.defaultOgImageUrl,
    });
    const langCandidate = this.readString(params.locale).trim() || 'en';
    const lang = /^[A-Za-z0-9-]+$/.test(langCandidate) ? langCandidate : 'en';
    const navHtml = this.renderNavigation(navLinks, currentSlug);
    const sections = this.asArray(pageRecord.sections)
      .map((section) => this.renderSection(section, assetUrlById, currentSlug))
      .join('');

    const html = `<div class="baw-page" data-page="${this.escapeHtml(params.pageId)}">${navHtml}${sections}</div>`;
    const css = this.baseCss;
    const pageJsonString = this.stableStringify(pageRecord);
    const navString = this.stableStringify(navLinks);
    const hash = createHash('sha256').update(pageJsonString + navString + currentSlug + css + headTags + lang).digest('hex');

    return { html, css, hash, headTags, lang };
  }
}
