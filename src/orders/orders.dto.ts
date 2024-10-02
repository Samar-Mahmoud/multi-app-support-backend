import z from 'zod';
import { ORDER } from './orders.type';

const orderProductSchema = z.object({
  product: z.string().min(1),
  quantity: z.number().min(1),
});

export const createOrderSchema = z.object({
  _id: z.string().optional(),
  description: z.string().optional(),
  vendorId: z.string().min(1),
  customerId: z.string().min(1),
  riderId: z.string().optional(),
  products: z.array(orderProductSchema),
  price: z.number(),
  status: z.enum(ORDER).default('pending'),
});

export const updateOrderSchema = z
  .object({
    description: z.string(),
    riderId: z.string(),
    products: z.array(orderProductSchema),
    price: z.number(),
    status: z.enum(ORDER).default('pending'),
  })
  .partial();

export type OrderProduct = z.infer<typeof orderProductSchema>;
export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderDto = z.infer<typeof updateOrderSchema>;
