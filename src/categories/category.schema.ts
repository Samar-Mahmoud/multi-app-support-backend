import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, ObjectId } from 'mongoose';

@Schema()
export class Category {
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
    default: null,
    required: false,
    ref: 'Category',
  })
  parentCategoryId: ObjectId | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
