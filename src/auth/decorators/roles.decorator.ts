import { Reflector } from '@nestjs/core';
import { USER_ROLES } from 'src/users/users.types';

export const Roles = Reflector.createDecorator<USER_ROLES[]>();
