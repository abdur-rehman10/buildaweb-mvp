import { z } from 'zod';
import { RENDERER_VERSION } from '../pages/renderer-version';

export const publishManifestSchema = z
  .object({
    schema_version: z.literal('1.0'),
    site_id: z.string().trim().min(1),
    publish_id: z.string().trim().min(1),
    hash: z.string().trim().min(1),
    renderer_version: z.string().trim().min(1),
    pages: z
      .array(
        z
          .object({
            page_id: z.string().trim().min(1),
            slug: z.string().trim().min(1),
            hash: z.string().trim().min(1),
            path: z.string().trim().min(1),
          })
          .strict(),
      )
      .min(1),
    assets: z
      .array(
        z
          .object({
            object_path: z.string().trim().min(1),
            content_type: z.string().trim().min(1),
          })
          .strict(),
      )
      .default([]),
  })
  .strict();

export type PublishManifest = z.infer<typeof publishManifestSchema>;

export function validatePublishManifest(input: unknown): PublishManifest {
  return publishManifestSchema.parse(input);
}

export function defaultRendererVersion() {
  return RENDERER_VERSION;
}
