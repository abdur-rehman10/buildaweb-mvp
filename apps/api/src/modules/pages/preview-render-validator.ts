import { z } from 'zod';
import { readStrictnessMode } from '../ai/repair-pipeline';

const styleSchema = z.record(z.string(), z.union([z.string(), z.number()]));

const nodeSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    type: z.string().trim().min(1),
    label: z.string().optional(),
    text: z.string().optional(),
    content: z.string().optional(),
    href: z.string().optional(),
    url: z.string().optional(),
    asset_ref: z.string().optional(),
    src: z.string().optional(),
    alt: z.string().optional(),
    tag: z.string().optional(),
    size: z.union([z.string(), z.number()]).optional(),
    style: styleSchema.optional(),
  })
  .strict();

const blockSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    style: styleSchema.optional(),
    nodes: z.array(nodeSchema),
  })
  .strict();

const sectionSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    style: styleSchema.optional(),
    blocks: z.array(blockSchema),
  })
  .strict();

const previewEditorSchema = z
  .object({
    sections: z.array(sectionSchema),
    tokens: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export function previewRenderMode(raw: string | undefined) {
  return readStrictnessMode(raw);
}

export function validatePreviewEditorJson(input: unknown) {
  return previewEditorSchema.parse(input);
}
