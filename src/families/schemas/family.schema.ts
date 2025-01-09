import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
  toObject: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Family {
  readonly createdAt: Date;
  readonly updatedAt: Date;

  @Prop({ virtual: true })
  readonly id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  ownerUserId: string;

  @Prop({ required: true, default: [] })
  userIds: string[];

  @Prop({ required: true, default: [] })
  deviceIds: string[];
}

export type FamilyDocument = HydratedDocument<Family>;
export const FamilySchema = SchemaFactory.createForClass(Family);
