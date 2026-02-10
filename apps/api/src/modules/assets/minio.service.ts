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
    this.publicBaseUrl =
      this.config.get<string>('MINIO_PUBLIC_BASE_URL') ?? `${useSSL ? 'https' : 'http'}://${endPoint}:${port}`;

    this.client = new MinioClient({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
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
    return `${base}/${this.bucketName}/${objectPath}`;
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
