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
import { ObjectId, Types } from 'mongoose';
import { ParseObjectIdPipe } from '../pipes/objectId.pipe';

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

  @Get('info/:id')
  findOne(@Param('id', ParseObjectIdPipe) vendorId: ObjectId) {
    return this.vendorsService.findOne(vendorId);
  }

  @Get(':id')
  findCategoryVendors(
    @Param('id', ParseObjectIdPipe) categoryId: ObjectId,
  ) {
    return this.vendorsService.findCategoryVendors(categoryId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) vendorId: ObjectId,
    @Body(new ZodValidationPipe(updateVendorSchema))
    updateVendorDto: UpdateVendorDto,
  ) {
    return this.vendorsService.update({
      vendorId,
      updateVendorDto,
    });
  }

  @Delete(':id')
  delete(@Param('id', ParseObjectIdPipe) vendorId: ObjectId) {
    return this.vendorsService.delete(vendorId);
  }
}
