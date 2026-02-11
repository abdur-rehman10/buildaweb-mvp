import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { PexelsService } from './pexels.service';

@Module({
  providers: [AiService, PexelsService],
  exports: [AiService, PexelsService],
})
export class AiModule {}
