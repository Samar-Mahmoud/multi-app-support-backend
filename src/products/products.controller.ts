import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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

@Controller('categories/:categoryId/vendors/:vendorId/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(z.array(createProductSchema)))
    createProductDto: CreateProductDto[],
  ) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findVendorProducts(@Param('vendorId', ParseObjectIdPipe) vendorId: ObjectId) {
    return this.productsService.findVendorProducts(vendorId);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) productId: ObjectId) {
    return this.productsService.findOne(productId);
  }

  @Patch(':id')
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
  delete(@Param('id', ParseObjectIdPipe) productId: ObjectId) {
    return this.productsService.delete(productId);
  }
}
