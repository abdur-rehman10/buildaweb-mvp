import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type JsonRecord = Record<string, unknown>;

@Injectable()
export class PexelsService {
  constructor(private readonly config: ConfigService) {}

  private asRecord(value: unknown): JsonRecord | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as JsonRecord;
  }

  private asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private readString(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return '';
  }

  async searchImage(query: string): Promise<string | null> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return null;

    const apiKey = this.config.get<string>('PEXELS_API_KEY')?.trim() ?? '';
    if (!apiKey) return null;

    const endpoint = `https://api.pexels.com/v1/search?query=${encodeURIComponent(normalizedQuery)}&per_page=1`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as JsonRecord;
    const photos = this.asArray(payload.photos);
    const firstPhoto = this.asRecord(photos[0]);
    const src = this.asRecord(firstPhoto?.src);
    const large = this.readString(src?.large).trim();

    return large || null;
  }
}
