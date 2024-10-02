import z from 'zod';

export const createCategorySchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  parentCategoryId: z.string().nullable().default(null),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1),
    description: z.string(),
    parentCategoryId: z.string().nullable().default(null),
  })
  .partial();

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
