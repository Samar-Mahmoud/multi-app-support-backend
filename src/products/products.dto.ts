import z from 'zod';

export const createProductSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  vendorId: z.string().min(1),
  price: z.number(),
});

export const updateProductSchema = z
  .object({
    name: z.string().min(1),
    description: z.string(),
    vendorId: z.string().min(1),
    price: z.number(),
  })
  .partial();

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
