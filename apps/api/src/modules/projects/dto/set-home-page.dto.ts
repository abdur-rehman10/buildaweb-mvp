import { IsString, MinLength } from 'class-validator';

export class SetHomePageDto {
  @IsString()
  @MinLength(1)
  pageId!: string;
}
