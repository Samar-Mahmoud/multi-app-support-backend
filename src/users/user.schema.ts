import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { USER_ROLES, USER_ROLES_ARR } from './users.types';

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
    enum: USER_ROLES_ARR,
  })
  role: USER_ROLES;
}

export const UserSchema = SchemaFactory.createForClass(User);
