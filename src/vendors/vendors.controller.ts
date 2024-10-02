import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
import { ParseObjectIdPipe } from '../pipes/objectId.pipe';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { USER } from '../users/users.types';

@UseGuards(JwtGuard, RolesGuard)
@Controller('categories/:categoryId/vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @Roles([USER.ADMIN, USER.SALES])
  create(
    @Param('categoryId', ParseObjectIdPipe) categoryId: ObjectId,
    @Body(new ZodValidationPipe(z.array(createVendorSchema)))
    createVendorDto: CreateVendorDto[],
  ) {
    return this.vendorsService.create(categoryId, createVendorDto);
  }

  @Get()
  @Roles([
    USER.ADMIN,
    USER.SALES,
    USER.TECH_SUPPORT,
    USER.CUSTOMER,
    USER.VENDOR,
    USER.RIDER,
  ])
  findCategoryVendors(
    @Param('categoryId', ParseObjectIdPipe) categoryId: ObjectId,
  ) {
    return this.vendorsService.findCategoryVendors(categoryId);
  }

  @Get(':id')
  @Roles([
    USER.ADMIN,
    USER.SALES,
    USER.TECH_SUPPORT,
    USER.CUSTOMER,
    USER.VENDOR,
    USER.RIDER,
  ])
  findOne(@Param('id', ParseObjectIdPipe) vendorId: ObjectId) {
    return this.vendorsService.findOne(vendorId);
  }

  @Patch(':id')
  @Roles([USER.ADMIN, USER.SALES, USER.VENDOR])
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
  @Roles([USER.ADMIN, USER.SALES, USER.VENDOR])
  delete(@Param('id', ParseObjectIdPipe) vendorId: ObjectId) {
    return this.vendorsService.delete(vendorId);
  }
}
