import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ type: String, default: null, trim: true })
  name?: string | null;

  // MVP: keep tenant ready, default single-tenant later
  @Prop({ default: 'default' })
  tenantId!: string;

  @Prop({ default: 'active', enum: ['active', 'disabled'] })
  status!: 'active' | 'disabled';
}

export const UserSchema = SchemaFactory.createForClass(User);

// indexes
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
