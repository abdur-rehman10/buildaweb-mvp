import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateProjectSettingsDto {
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  siteName?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  logoAssetId?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  faviconAssetId?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  defaultOgImageAssetId?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  locale?: string | null;
}
