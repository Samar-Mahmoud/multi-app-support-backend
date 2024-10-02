import z from 'zod';

/**
 * validate environment variables
 */
const envSchema = z.object({
  DB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(1),
});

export const validate = (config: Record<string, unknown>) => {
  return envSchema.parse(config);
};
