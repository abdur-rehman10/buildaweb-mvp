import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  defaultLocale?: string;
}
