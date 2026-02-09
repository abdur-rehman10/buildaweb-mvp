import { IsString, MinLength } from 'class-validator';

export class SetLatestPublishDto {
  @IsString()
  @MinLength(1)
  publishId!: string;
}
