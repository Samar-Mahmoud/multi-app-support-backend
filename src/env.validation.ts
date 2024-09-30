import z from 'zod';

const envSchema = z.object({
});

export const validate = (config: Record<string, unknown>) => {
  return envSchema.parse(config);
}