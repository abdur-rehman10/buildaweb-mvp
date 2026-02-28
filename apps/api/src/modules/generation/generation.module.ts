import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GenerationJob, GenerationJobSchema } from './generation-job.schema';
import { GenerationService } from './generation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GenerationJob.name, schema: GenerationJobSchema },
    ]),
  ],
  providers: [GenerationService],
  exports: [GenerationService],
})
export class GenerationModule {}
