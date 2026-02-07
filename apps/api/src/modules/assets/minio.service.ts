import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';

@Injectable()
export class MinioService {
  private readonly client: MinioClient;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;

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

  async upload(params: { objectPath: string; buffer: Buffer; mimeType: string; sizeBytes: number }) {
    await this.client.putObject(this.bucketName, params.objectPath, params.buffer, params.sizeBytes, {
      'Content-Type': params.mimeType,
    });

    const base = this.publicBaseUrl.replace(/\/$/, '');
    const objectPath = this.encodedPath(params.objectPath);
    return `${base}/${this.bucketName}/${objectPath}`;
  }
}
