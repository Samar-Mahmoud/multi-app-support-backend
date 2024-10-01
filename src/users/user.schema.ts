import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { USER_ROLES } from './users.types';

@Schema()
export class User {
  @Prop({
    required: true,
    minlength: 1,
    unique: true,
  })
  name: string;

  @Prop({
    required: true,
    minlength: 1,
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
    minlength: 1,
  })
  password: string;

  @Prop({
    required: true,
  })
  role: USER_ROLES;
}

export const UserSchema = SchemaFactory.createForClass(User);
