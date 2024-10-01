import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, ObjectId } from 'mongoose';

@Schema()
export class Product {
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
    ref: 'Vendor',
  })
  vendorId: ObjectId;

  @Prop({
    required: true,
  })
  price: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
