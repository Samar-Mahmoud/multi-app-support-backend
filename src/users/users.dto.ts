import z from 'zod';
import { USER } from './users.types';

export const createUserSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(USER),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(1),
    role: z.enum(USER),
  })
  .partial();

export const loginUserSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type LoginUserDto = z.infer<typeof loginUserSchema>;
