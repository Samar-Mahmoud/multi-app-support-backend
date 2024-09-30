import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import z from 'zod';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  createCategorySchema,
  UpdateCategoryDto,
  updateCategorySchema,
} from './categories.dto';
import { ZodValidationPipe } from '../pipes/validation.pipe';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(z.array(createCategorySchema)))
    createCategoryDto: CreateCategoryDto[],
  ) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(parentCategoryId?: ObjectId) {
    return this.categoriesService.findAll(parentCategoryId);
  }

  @Get(':id')
  findOne(@Param('id') categoryId: ObjectId) {
    return this.categoriesService.findOne(categoryId);
  }

  @Patch(':id')
  update(
    @Param('id') categoryId: ObjectId,
    @Body(new ZodValidationPipe(updateCategorySchema))
    updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update({
      categoryId,
      updateCategoryDto,
    });
  }

  @Delete(':id')
  delete(@Param('id') categoryId: ObjectId) {
    return this.categoriesService.delete(categoryId);
  }
}
