import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import {
  CreateVendorDto,
  createVendorSchema,
  UpdateVendorDto,
  updateVendorSchema,
} from './vendors.dto';
import { ZodValidationPipe } from '../pipes/validation.pipe';
import { z } from 'zod';
import { ObjectId } from 'mongoose';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(z.array(createVendorSchema)))
    createVendorDto: CreateVendorDto[],
  ) {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  findCategoryVendors(
    @Body(
      new ZodValidationPipe(z.object({ categoryId: z.string().optional() })),
    )
    { categoryId }: { categoryId?: ObjectId },
  ) {
    return this.vendorsService.findCategoryVendors(categoryId);
  }

  @Get(':id')
  findOne(@Param('id') vendorId: ObjectId) {
    return this.vendorsService.findOne(vendorId);
  }

  @Patch(':id')
  update(
    @Param('id') vendorId: ObjectId,
    @Body(new ZodValidationPipe(updateVendorSchema))
    updateVendorDto: UpdateVendorDto,
  ) {
    return this.vendorsService.update({
      vendorId,
      updateVendorDto,
    });
  }

  @Delete(':id')
  delete(@Param('id') vendorId: ObjectId) {
    return this.vendorsService.delete(vendorId);
  }
}
