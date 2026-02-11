import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';
import { Readable } from 'node:stream';

@Injectable()
export class MinioService {
  private readonly client: MinioClient;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;
  private bucketReadyPromise: Promise<void> | null = null;

  constructor(private readonly config: ConfigService) {
    const endPoint = this.config.get<string>('MINIO_ENDPOINT') ?? 'localhost';
    const port = Number(this.config.get<string>('MINIO_PORT') ?? 9000);
    const useSSL = (this.config.get<string>('MINIO_USE_SSL') ?? 'false').toLowerCase() === 'true';
    const accessKey = this.config.get<string>('MINIO_ACCESS_KEY') ?? 'minio';
    const secretKey = this.config.get<string>('MINIO_SECRET_KEY') ?? 'minio12345';

    this.bucketName = this.config.get<string>('MINIO_BUCKET') ?? 'buildaweb';
    this.publicBaseUrl = this.resolvePublicBaseUrl({
      endPoint,
      port,
      useSSL,
    });

    this.client = new MinioClient({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  private trimOrEmpty(value: string | undefined | null) {
    return (value ?? '').trim();
  }

  private withHttpProtocol(raw: string) {
    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }
    return `http://${raw}`;
  }

  private normalizePublicBaseUrl(raw: string) {
    const parsed = new URL(this.withHttpProtocol(raw));
    const normalizedPath = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');
    return `${parsed.origin}${normalizedPath}`;
  }

  private resolvePublicBaseUrl(params: { endPoint: string; port: number; useSSL: boolean }) {
    const mediaPublicBaseUrl = this.trimOrEmpty(this.config.get<string>('MEDIA_PUBLIC_BASE_URL'));
    if (mediaPublicBaseUrl) {
      return this.normalizePublicBaseUrl(mediaPublicBaseUrl);
    }

    const isProduction = this.trimOrEmpty(this.config.get<string>('NODE_ENV')).toLowerCase() === 'production';
    if (isProduction) {
      const publicAppUrl = this.trimOrEmpty(this.config.get<string>('PUBLIC_APP_URL'));
      if (publicAppUrl) {
        const appUrl = new URL(this.withHttpProtocol(publicAppUrl));
        return `${appUrl.origin}/media`;
      }
    }

    const explicitMinioUrl = this.trimOrEmpty(this.config.get<string>('MINIO_PUBLIC_URL'));
    if (explicitMinioUrl) {
      return this.normalizePublicBaseUrl(explicitMinioUrl);
    }

    const explicitMinioBaseUrl = this.trimOrEmpty(this.config.get<string>('MINIO_PUBLIC_BASE_URL'));
    if (explicitMinioBaseUrl) {
      return this.normalizePublicBaseUrl(explicitMinioBaseUrl);
    }

    return `${params.useSSL ? 'https' : 'http'}://${params.endPoint}:${params.port}`;
  }

  private encodedPath(path: string) {
    return path
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
  }

  private async ensureBucketReady() {
    if (!this.bucketReadyPromise) {
      this.bucketReadyPromise = (async () => {
        const exists = await this.client.bucketExists(this.bucketName);
        if (!exists) {
          await this.client.makeBucket(this.bucketName, 'us-east-1');
        }

        const publicReadPolicy = JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        });

        await this.client.setBucketPolicy(this.bucketName, publicReadPolicy);
      })();
    }

    return this.bucketReadyPromise;
  }

  async upload(params: { objectPath: string; buffer: Buffer; mimeType: string; sizeBytes: number }) {
    await this.ensureBucketReady();

    await this.client.putObject(this.bucketName, params.objectPath, params.buffer, params.sizeBytes, {
      'Content-Type': params.mimeType,
    });

    const base = this.publicBaseUrl.replace(/\/$/, '');
    const objectPath = this.encodedPath(params.objectPath);
    const bucketPath = base.endsWith(`/${this.bucketName}`) ? base : `${base}/${this.bucketName}`;
    return `${bucketPath}/${objectPath}`;
  }

  async statObject(params: { objectPath: string }) {
    await this.ensureBucketReady();
    return this.client.statObject(this.bucketName, params.objectPath);
  }

  async getObjectStream(params: { objectPath: string }): Promise<Readable> {
    await this.ensureBucketReady();
    return this.client.getObject(this.bucketName, params.objectPath);
  }
}
