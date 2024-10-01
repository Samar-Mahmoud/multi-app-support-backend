import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, ObjectId, model } from 'mongoose';
import { Product } from '../products/products.schema';

@Schema()
export class Vendor {
  @Prop({
    required: true,
    minlength: 1,
    unique: true,
  })
  name: string;

  @Prop({
    required: false,
  })
  description: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'Category',
  })
  categoryId: ObjectId;

  @Prop({
    required: true,
    minlength: 1,
  })
  location: string;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);
