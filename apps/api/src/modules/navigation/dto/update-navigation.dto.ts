import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

export class NavigationItemDto {
  @IsString()
  @MinLength(1)
  label!: string;

  @IsString()
  @MinLength(1)
  pageId!: string;
}

export class NavigationCtaDto {
  @IsString()
  @MinLength(1)
  label!: string;

  @IsString()
  @MinLength(1)
  href!: string;
}

export class UpdateNavigationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavigationItemDto)
  items!: NavigationItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => NavigationCtaDto)
  cta?: NavigationCtaDto;
}
