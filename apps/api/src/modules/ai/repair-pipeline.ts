import { createHash } from 'crypto';

type JsonValue = null | boolean | number | string | JsonObject | JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

export type RepairStrictnessMode = 'strict' | 'repair';

export interface RepairAuditEntry {
  path: string;
  action:
    | 'fill-missing-id'
    | 'canonical-sort'
    | 'default-coercion'
    | 'drop-unsafe-field'
    | 'normalize-href'
    | 'normalize-token-ref'
    | 'inject-image-alt'
    | 'demote-extra-h1';
  detail: string;
}

export interface RepairResult<T = unknown> {
  repaired: T;
  audit: RepairAuditEntry[];
}

export interface RepairOptions {
  fillMissingIds?: boolean;
}

interface RepairTraversalState {
  hasSeenH1: boolean;
}

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function hashId(seed: string) {
  const hash = createHash('sha1').update(seed).digest('hex');
  return hash.slice(0, 12);
}

function normalizeHref(value: string): string {
  const href = value.trim();
  if (!href) return '#';
  if (href.startsWith('#')) return href;
  if (/^https:\/\//i.test(href)) return href;
  return '#';
}

function normalizeTokenRef(value: JsonValue): JsonValue {
  if (typeof value !== 'string') return value;
  if (value.startsWith('token:')) return value;
  return `literal:${value}`;
}

function resolveFontSize(record: JsonObject): number {
  const direct = record.size;
  if (typeof direct === 'number') return direct;
  if (typeof direct === 'string') {
    const lower = direct.toLowerCase();
    if (
      lower === 'h1' ||
      lower === '3xl' ||
      lower === '4xl' ||
      lower === 'display'
    ) {
      return 48;
    }
    if (lower === 'h2' || lower === '2xl' || lower === 'xl') {
      return 32;
    }
    const parsed = Number.parseFloat(lower);
    if (Number.isFinite(parsed)) return parsed;
  }

  const style = isObject(record.style) ? record.style : null;
  const fontSize = style?.fontSize;
  if (typeof fontSize === 'number') return fontSize;
  if (typeof fontSize === 'string') {
    const parsed = Number.parseFloat(fontSize);
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
}

function resolveTextTag(record: JsonObject): 'h1' | 'h2' | 'p' {
  const explicitTag =
    typeof record.tag === 'string' ? record.tag.toLowerCase() : '';
  if (explicitTag === 'h1' || explicitTag === 'h2' || explicitTag === 'p') {
    return explicitTag;
  }

  const size = resolveFontSize(record);
  if (size >= 42) return 'h1';
  if (size >= 30) return 'h2';
  return 'p';
}

function visit(
  value: JsonValue,
  path: string,
  audit: RepairAuditEntry[],
  options: Required<RepairOptions>,
  state: RepairTraversalState,
): JsonValue {
  if (Array.isArray(value)) {
    const next = value.map((entry, index) =>
      visit(entry, `${path}[${index}]`, audit, options, state),
    );
    const sorted = [...next].sort((a, b) =>
      JSON.stringify(a).localeCompare(JSON.stringify(b)),
    );
    if (JSON.stringify(next) !== JSON.stringify(sorted)) {
      audit.push({
        path,
        action: 'canonical-sort',
        detail: 'Sorted array entries by canonical JSON value order',
      });
    }
    return sorted;
  }

  if (!isObject(value)) return value;

  const next: JsonObject = {};
  const keys = Object.keys(value).sort((a, b) => a.localeCompare(b));

  for (const key of keys) {
    const currentPath = path ? `${path}.${key}` : key;
    if (key === 'rawHtml') {
      audit.push({
        path: currentPath,
        action: 'drop-unsafe-field',
        detail: 'Removed rawHtml field',
      });
      continue;
    }

    let entry = visit(value[key], currentPath, audit, options, state);

    if (key === 'href' && typeof entry === 'string') {
      const normalized = normalizeHref(entry);
      if (normalized !== entry) {
        audit.push({
          path: currentPath,
          action: 'normalize-href',
          detail: `Normalized href from "${entry}" to "${normalized}"`,
        });
      }
      entry = normalized;
    }

    if (key === 'tokenRef') {
      const normalized = normalizeTokenRef(entry);
      if (normalized !== entry) {
        audit.push({
          path: currentPath,
          action: 'normalize-token-ref',
          detail: 'Converted tokenRef to literal fallback',
        });
      }
      entry = normalized;
    }

    next[key] = entry;
  }

  if (options.fillMissingIds && !('id' in next)) {
    const generatedId = hashId(path || 'root');
    next.id = generatedId;
    audit.push({
      path: path || 'root',
      action: 'fill-missing-id',
      detail: `Filled missing id with deterministic value "${generatedId}"`,
    });
  }

  if (next.type === 'button' && typeof next.variant !== 'string') {
    next.variant = 'primary';
    audit.push({
      path: path || 'root',
      action: 'default-coercion',
      detail: 'Defaulted button variant to "primary"',
    });
  }

  if (
    next.type === 'image' &&
    (typeof next.alt !== 'string' || !next.alt.trim())
  ) {
    next.alt = 'Image';
    audit.push({
      path: path || 'root',
      action: 'inject-image-alt',
      detail: 'Injected deterministic default alt text "Image"',
    });
  }

  if (next.type === 'text') {
    const resolvedTag = resolveTextTag(next);
    if (resolvedTag === 'h1') {
      if (state.hasSeenH1) {
        next.tag = 'h2';
        audit.push({
          path: path || 'root',
          action: 'demote-extra-h1',
          detail: 'Demoted additional h1 node to h2 for one-h1 determinism',
        });
      } else {
        state.hasSeenH1 = true;
      }
    }
  }

  return next;
}

export function repairPayload<T = unknown>(
  input: T,
  options?: RepairOptions,
): RepairResult<T> {
  const audit: RepairAuditEntry[] = [];
  const resolved: Required<RepairOptions> = {
    fillMissingIds: options?.fillMissingIds ?? true,
  };
  const repaired = visit(input as JsonValue, '', audit, resolved, {
    hasSeenH1: false,
  }) as T;
  return { repaired, audit };
}

export function readStrictnessMode(
  raw: string | undefined,
): RepairStrictnessMode {
  const normalized = (raw ?? '').trim().toLowerCase();
  return normalized === 'repair' ? 'repair' : 'strict';
}
