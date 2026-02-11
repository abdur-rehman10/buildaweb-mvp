import { IsString, MinLength } from 'class-validator';

export class GenerateProjectDto {
  @IsString()
  @MinLength(1)
  prompt!: string;
}
