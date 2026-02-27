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
    | 'normalize-token-ref';
  detail: string;
}

export interface RepairResult<T = unknown> {
  repaired: T;
  audit: RepairAuditEntry[];
}

export interface RepairOptions {
  fillMissingIds?: boolean;
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

function visit(
  value: JsonValue,
  path: string,
  audit: RepairAuditEntry[],
  options: Required<RepairOptions>,
): JsonValue {
  if (Array.isArray(value)) {
    const next = value.map((entry, index) =>
      visit(entry, `${path}[${index}]`, audit, options),
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

    let entry = visit(value[key], currentPath, audit, options);

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
  const repaired = visit(input as JsonValue, '', audit, resolved) as T;
  return { repaired, audit };
}

export function readStrictnessMode(
  raw: string | undefined,
): RepairStrictnessMode {
  const normalized = (raw ?? '').trim().toLowerCase();
  return normalized === 'repair' ? 'repair' : 'strict';
}
