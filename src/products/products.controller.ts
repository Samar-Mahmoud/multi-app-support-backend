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
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  createProductSchema,
  UpdateProductDto,
  updateProductSchema,
} from './products.dto';
import { ZodValidationPipe } from '../pipes/validation.pipe';
import { z } from 'zod';
import { ObjectId } from 'mongoose';
import { ParseObjectIdPipe } from '../pipes/objectId.pipe';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { USER } from '../users/users.types';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtGuard, RolesGuard)
@Controller('categories/:categoryId/vendors/:vendorId/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles([USER.ADMIN, USER.SALES, USER.VENDOR])
  create(
    @Param('vendorId', ParseObjectIdPipe) vendorId: ObjectId,
    @Body(new ZodValidationPipe(z.array(createProductSchema)))
    createProductDto: CreateProductDto[],
  ) {
    return this.productsService.create(vendorId, createProductDto);
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
  findVendorProducts(@Param('vendorId', ParseObjectIdPipe) vendorId: ObjectId) {
    return this.productsService.findVendorProducts(vendorId);
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
  findOne(@Param('id', ParseObjectIdPipe) productId: ObjectId) {
    return this.productsService.findOne(productId);
  }

  @Patch(':id')
  @Roles([USER.ADMIN, USER.SALES, USER.VENDOR])
  update(
    @Param('id', ParseObjectIdPipe) productId: ObjectId,
    @Body(new ZodValidationPipe(updateProductSchema))
    updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update({
      productId,
      updateProductDto,
    });
  }

  @Delete(':id')
  @Roles([USER.ADMIN, USER.SALES, USER.VENDOR])
  delete(@Param('id', ParseObjectIdPipe) productId: ObjectId) {
    return this.productsService.delete(productId);
  }
}
