import { Reflector } from '@nestjs/core';
import { USER_ROLES } from 'src/users/users.types';

/*
 * a custom decorator to apply role-based access control
 */
export const Roles = Reflector.createDecorator<USER_ROLES[]>();
