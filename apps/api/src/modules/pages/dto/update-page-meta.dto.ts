import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePageMetaDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @IsOptional()
  @IsObject()
  seoJson?: Record<string, unknown>;
}
