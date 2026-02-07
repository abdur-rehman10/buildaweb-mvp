import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  slug!: string;

  @IsOptional()
  @IsBoolean()
  isHome?: boolean;
}
