import { createHash } from 'node:crypto';
import { RENDERER_VERSION } from './renderer-version';

function stableNormalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((entry) => stableNormalize(entry));
  if (value && typeof value === 'object') {
    const asRecord = value as Record<string, unknown>;
    const normalized: Record<string, unknown> = {};
    for (const key of Object.keys(asRecord).sort((a, b) =>
      a.localeCompare(b),
    )) {
      normalized[key] = stableNormalize(asRecord[key]);
    }
    return normalized;
  }
  return value;
}

export function canonicalStringify(value: unknown): string {
  return JSON.stringify(stableNormalize(value));
}

export function canonicalPageHash(params: {
  tokensJson: unknown;
  pageJson: unknown;
  rendererVersion?: string;
}): string {
  const rendererVersion = (params.rendererVersion ?? RENDERER_VERSION).trim();
  return createHash('sha256')
    .update(canonicalStringify(params.tokensJson))
    .update(canonicalStringify(params.pageJson))
    .update(rendererVersion)
    .digest('hex');
}
