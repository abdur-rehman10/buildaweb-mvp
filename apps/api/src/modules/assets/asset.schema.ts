import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AssetDocument = HydratedDocument<Asset>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Asset {
  @Prop({ required: true, default: 'default' })
  tenantId!: string;

  @Prop({ required: true })
  projectId!: string;

  @Prop({ required: true })
  storagePath!: string;

  @Prop({ required: true })
  publicUrl!: string;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ required: true })
  sizeBytes!: number;

  createdAt?: Date;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);

AssetSchema.index({ tenantId: 1, projectId: 1, createdAt: -1 });
