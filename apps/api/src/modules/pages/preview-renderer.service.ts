import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

type JsonRecord = Record<string, unknown>;
type RenderNavLink = { label: string; href: string };

const IMAGE_PLACEHOLDER_SRC = 'https://placehold.co/1200x800?text=Image';

@Injectable()
export class PreviewRendererService {
  private readonly baseCss = `
.baw-page{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;background:#ffffff;max-width:1200px;margin:0 auto;padding:24px;line-height:1.5}
.baw-nav{display:flex;flex-wrap:wrap;gap:12px;margin:0 0 24px;padding:0 0 12px;border-bottom:1px solid #e5e7eb}
.baw-nav a{color:#111827;text-decoration:none;font-weight:600}
.baw-nav a:hover{text-decoration:underline}
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

  private renderNode(node: unknown, assetUrlById: Record<string, string>): string {
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
      return `<a class="baw-node-button" href="${this.escapeHtml(href)}">${this.escapeHtml(label)}</a>`;
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

  private renderBlock(block: unknown, assetUrlById: Record<string, string>): string {
    const record = this.asRecord(block);
    if (!record) return '<div class="baw-block"><!-- Invalid block --></div>';

    const blockId = this.readId(record);
    const nodes = this.asArray(record.nodes).map((node) => this.renderNode(node, assetUrlById)).join('');
    const attr = blockId ? ` data-block="${this.escapeHtml(blockId)}"` : '';
    return `<div class="baw-block"${attr}>${nodes}</div>`;
  }

  private renderSection(section: unknown, assetUrlById: Record<string, string>): string {
    const record = this.asRecord(section);
    if (!record) return '<section class="baw-section"><!-- Invalid section --></section>';

    const sectionId = this.readId(record);
    const blocks = this.asArray(record.blocks).map((block) => this.renderBlock(block, assetUrlById)).join('');
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

  private renderNavigation(navLinks?: RenderNavLink[]): string {
    if (!Array.isArray(navLinks) || navLinks.length === 0) return '';

    const links = navLinks
      .filter((item) => item && typeof item.label === 'string' && typeof item.href === 'string')
      .map(
        (item) =>
          `<a href="${this.escapeHtml(item.href)}">${this.escapeHtml(item.label.trim() || item.href)}</a>`,
      )
      .join('');

    if (!links) return '';
    return `<nav class="baw-nav">${links}</nav>`;
  }

  render(params: {
    pageId: string;
    editorJson: unknown;
    assetUrlById?: Record<string, string>;
    navLinks?: RenderNavLink[];
  }) {
    const pageRecord = this.asRecord(params.editorJson) ?? {};
    const assetUrlById = params.assetUrlById ?? {};
    const navLinks = params.navLinks ?? [];
    const navHtml = this.renderNavigation(navLinks);
    const sections = this.asArray(pageRecord.sections).map((section) => this.renderSection(section, assetUrlById)).join('');

    const html = `<div class="baw-page" data-page="${this.escapeHtml(params.pageId)}">${navHtml}${sections}</div>`;
    const css = this.baseCss;
    const pageJsonString = this.stableStringify(pageRecord);
    const navString = this.stableStringify(navLinks);
    const hash = createHash('sha256').update(pageJsonString + navString + css).digest('hex');

    return { html, css, hash };
  }
}
