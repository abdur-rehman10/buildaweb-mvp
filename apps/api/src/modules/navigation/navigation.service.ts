import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PagesService } from '../pages/pages.service';
import { Navigation, NavigationDocument } from './navigation.schema';

export class InvalidPageReferenceException extends BadRequestException {}

type NavigationItem = { label: string; pageId: string };
type NavigationCta = { label: string; href: string };

@Injectable()
export class NavigationService {
  constructor(
    @InjectModel(Navigation.name) private readonly navigationModel: Model<NavigationDocument>,
    private readonly pages: PagesService,
  ) {}

  private normalizeItems(items: Array<{ label: string; pageId: string }>): NavigationItem[] {
    return items.map((item) => ({
      label: item.label.trim(),
      pageId: item.pageId,
    }));
  }

  private normalizeCta(cta?: { label: string; href: string } | null): NavigationCta | undefined {
    if (!cta) return undefined;

    return {
      label: cta.label.trim(),
      href: cta.href.trim(),
    };
  }

  private async ensureProjectPageIds(params: {
    tenantId: string;
    projectId: string;
    items: NavigationItem[];
  }) {
    const pages = await this.pages.listPages({
      tenantId: params.tenantId,
      projectId: params.projectId,
    });

    const validPageIds = new Set(pages.map((page) => page.id));
    const invalid = params.items.find((item) => !validPageIds.has(item.pageId));

    if (invalid) {
      throw new InvalidPageReferenceException('One or more pageIds do not belong to this project');
    }
  }

  private toResponse(nav: NavigationDocument | null): { items: NavigationItem[]; cta?: NavigationCta } {
    const items = Array.isArray(nav?.itemsJson) ? (nav?.itemsJson as NavigationItem[]) : [];
    const cta = nav?.ctaJson && typeof nav.ctaJson === 'object' ? (nav.ctaJson as NavigationCta) : undefined;

    return {
      items,
      ...(cta ? { cta } : {}),
    };
  }

  async getOrCreateByProject(params: { tenantId: string; projectId: string; ownerUserId: string }) {
    let nav = await this.navigationModel.findOne({
      tenantId: params.tenantId,
      projectId: params.projectId,
      ownerUserId: params.ownerUserId,
    });

    if (!nav) {
      const pages = await this.pages.listPages({ tenantId: params.tenantId, projectId: params.projectId });
      const sortedPages = [...pages].sort((a, b) => Number(b.isHome) - Number(a.isHome));

      const items: NavigationItem[] = sortedPages.map((page) => ({
        label: page.title,
        pageId: page.id,
      }));

      nav = await this.navigationModel.create({
        tenantId: params.tenantId,
        projectId: params.projectId,
        ownerUserId: params.ownerUserId,
        itemsJson: items,
      });
    }

    return this.toResponse(nav);
  }

  async upsertByProject(params: {
    tenantId: string;
    projectId: string;
    ownerUserId: string;
    items: Array<{ label: string; pageId: string }>;
    cta?: { label: string; href: string };
  }) {
    const normalizedItems = this.normalizeItems(params.items);
    const normalizedCta = this.normalizeCta(params.cta);

    await this.ensureProjectPageIds({
      tenantId: params.tenantId,
      projectId: params.projectId,
      items: normalizedItems,
    });

    const nav = await this.navigationModel.findOneAndUpdate(
      {
        tenantId: params.tenantId,
        projectId: params.projectId,
        ownerUserId: params.ownerUserId,
      },
      {
        $set: {
          itemsJson: normalizedItems,
          ctaJson: normalizedCta ?? null,
        },
      },
      { new: true, upsert: true },
    );

    return this.toResponse(nav);
  }
}
