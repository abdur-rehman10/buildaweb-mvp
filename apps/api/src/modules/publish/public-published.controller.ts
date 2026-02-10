import { Controller, Get, HttpException, HttpStatus, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { fail, ok } from '../../common/api-response';
import { PublishService } from './publish.service';

@Controller()
export class PublicPublishedController {
  constructor(private readonly publish: PublishService) {}

  @Get('published/:slug')
  async getPublishedMetadata(@Param('slug') slug: string) {
    const project = await this.publish.getProjectByPublishedSlug({ slug, onlyPublished: false });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    const publishedSlug = typeof project.publishedSlug === 'string' ? project.publishedSlug : slug;
    return ok({
      publishedSlug,
      isPublished: project.isPublished === true,
      publishedAt: project.publishedAt ?? null,
      publishedVersion: project.publishedVersion ?? null,
      updatedAt: project.updatedAt ?? null,
      url: project.isPublished === true ? `/p/${encodeURIComponent(publishedSlug)}/` : null,
    });
  }

  @Get('p/:slug')
  async servePublishedRoot(@Param('slug') slug: string, @Res() res: Response) {
    return this.servePublishedAsset(slug, '', res);
  }

  @Get('p/:slug/*path')
  async servePublishedPath(
    @Param('slug') slug: string,
    @Param('path') path: string | string[] | undefined,
    @Res() res: Response,
  ) {
    const normalizedPath = Array.isArray(path) ? path.join('/') : (path ?? '');
    return this.servePublishedAsset(slug, normalizedPath, res);
  }

  private async servePublishedAsset(slug: string, path: string, res: Response) {
    const published = await this.publish.loadPublishedObjectBySlug({ slug, requestPath: path });
    if (!published) {
      res.status(HttpStatus.NOT_FOUND).setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Not found');
      return;
    }

    res.status(HttpStatus.OK);
    res.setHeader('Content-Type', published.contentType);
    res.setHeader('Cache-Control', published.cacheControl);

    published.stream.on('error', () => {
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).end('Failed to load published site');
      } else {
        res.end();
      }
    });

    published.stream.pipe(res);
  }
}
