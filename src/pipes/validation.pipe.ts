import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

/*
 * validation pipe to validate the input value against the provided schema
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const res = this.schema.safeParse(value);
    if (res.success) {
      return res.data;
    }
    throw new BadRequestException(res.error.format());
  }
}
