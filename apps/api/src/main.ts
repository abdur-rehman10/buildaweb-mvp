import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const DEV_DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://app.localhost',
];

function isProduction() {
  return (process.env.NODE_ENV ?? '').toLowerCase() === 'production';
}

function parseOrigins(raw: string) {
  return [...new Set(raw.split(',').map((origin) => origin.trim()).filter(Boolean))];
}

function validateRequiredEnvForProduction() {
  if (!isProduction()) return;

  const requiredKeys = [
    'MONGO_URI',
    'JWT_SECRET',
    'BCRYPT_SALT_ROUNDS',
    'MINIO_ENDPOINT',
    'MINIO_PORT',
    'MINIO_ACCESS_KEY',
    'MINIO_SECRET_KEY',
    'MINIO_BUCKET',
    'CORS_ORIGINS',
  ];

  const missingKeys = requiredKeys.filter((key) => !(process.env[key] ?? '').trim());
  const errors: string[] = [];

  if (missingKeys.length > 0) {
    errors.push(`Missing required env vars for production: ${missingKeys.join(', ')}`);
  }

  const corsOrigins = parseOrigins(process.env.CORS_ORIGINS ?? '');
  if (corsOrigins.includes('*')) {
    errors.push('CORS_ORIGINS cannot include "*" in production.');
  }

  const hasMinioPublicUrl = (process.env.MINIO_PUBLIC_URL ?? '').trim().length > 0;
  const hasMinioPublicBaseUrl = (process.env.MINIO_PUBLIC_BASE_URL ?? '').trim().length > 0;
  const hasPublicAppUrl = (process.env.PUBLIC_APP_URL ?? '').trim().length > 0;
  if (!hasMinioPublicUrl && !hasMinioPublicBaseUrl && !hasPublicAppUrl) {
    errors.push(
      'Set one of MINIO_PUBLIC_URL, MINIO_PUBLIC_BASE_URL, or PUBLIC_APP_URL in production for browser-accessible asset URLs.',
    );
  }

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }
}

function resolveCorsOrigins() {
  const configured = parseOrigins(process.env.CORS_ORIGINS ?? '');
  if (configured.length > 0) return configured;
  return DEV_DEFAULT_CORS_ORIGINS;
}

async function bootstrap() {
  validateRequiredEnvForProduction();
  const app = await NestFactory.create(AppModule);

  // Allow frontend to call API from configured origins
  app.enableCors({
    origin: resolveCorsOrigins(),
    credentials: true,
  });

  // REST base prefix
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${port}/api/v1`);
}

bootstrap();
