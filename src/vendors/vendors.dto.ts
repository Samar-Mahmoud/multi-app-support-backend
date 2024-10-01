import z from 'zod';

export const createVendorSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  location: z.string().min(1),
});

export const updateVendorSchema = z
  .object({
    name: z.string().min(1),
    description: z.string(),
    categoryId: z.string().min(1),
    location: z.string().min(1),
  })
  .partial();

export type CreateVendorDto = z.infer<typeof createVendorSchema>;
export type UpdateVendorDto = z.infer<typeof updateVendorSchema>;
