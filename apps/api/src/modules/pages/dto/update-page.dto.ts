import { IsInt, IsObject, IsOptional, Min, ValidateIf } from 'class-validator';

export class UpdatePageDto {
  @IsObject()
  page!: Record<string, unknown>;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsObject()
  seoJson?: Record<string, unknown> | null;

  @IsInt()
  @Min(1)
  version!: number;
}
