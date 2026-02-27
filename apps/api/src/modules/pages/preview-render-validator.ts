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

function resolveFontSize(node: z.infer<typeof nodeSchema>): number {
  const direct = node.size;
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

  const styleFont = node.style?.fontSize;
  if (typeof styleFont === 'number') return styleFont;
  if (typeof styleFont === 'string') {
    const parsed = Number.parseFloat(styleFont);
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
}

function resolveTextTag(node: z.infer<typeof nodeSchema>): 'h1' | 'h2' | 'p' {
  const explicitTag = node.tag?.trim().toLowerCase();
  if (explicitTag === 'h1' || explicitTag === 'h2' || explicitTag === 'p') {
    return explicitTag;
  }

  const size = resolveFontSize(node);
  if (size >= 42) return 'h1';
  if (size >= 30) return 'h2';
  return 'p';
}

export function previewRenderMode(raw: string | undefined) {
  return readStrictnessMode(raw);
}

export function validatePreviewEditorJson(input: unknown) {
  return previewEditorSchema
    .superRefine((value, ctx) => {
      let h1Count = 0;

      value.sections.forEach((section, sectionIndex) => {
        section.blocks.forEach((block, blockIndex) => {
          block.nodes.forEach((node, nodeIndex) => {
            if (node.type === 'image') {
              const alt = node.alt?.trim() ?? '';
              if (!alt) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  path: [
                    'sections',
                    sectionIndex,
                    'blocks',
                    blockIndex,
                    'nodes',
                    nodeIndex,
                    'alt',
                  ],
                  message: 'Image nodes must include non-empty alt text',
                });
              }
            }

            if (node.type === 'text' && resolveTextTag(node) === 'h1') {
              h1Count += 1;
            }
          });
        });
      });

      if (h1Count > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sections'],
          message: `Only one h1 is allowed per page, found ${h1Count}`,
        });
      }
    })
    .parse(input);
}
