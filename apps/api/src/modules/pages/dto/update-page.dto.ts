import { IsInt, IsObject, Min } from 'class-validator';

export class UpdatePageDto {
  @IsObject()
  page!: Record<string, unknown>;

  @IsInt()
  @Min(1)
  version!: number;
}
