import { IsString, MinLength } from 'class-validator';

export class DuplicatePageDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  slug!: string;
}
