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
import { ParseObjectIdPipe } from '../pipes/objectId.pipe';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { USER } from '../users/users.types';

@UseGuards(JwtGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  @Roles([USER.ADMIN, USER.SALES])
  create(
    @Body(new ZodValidationPipe(z.array(createCategorySchema)))
    createCategoryDto: CreateCategoryDto[],
  ) {
    return this.categoriesService.create(createCategoryDto);
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
  findAll(parentCategoryId?: ObjectId) {
    return this.categoriesService.findAll(parentCategoryId);
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
  findOne(@Param('id', ParseObjectIdPipe) categoryId: ObjectId) {
    return this.categoriesService.findOne(categoryId);
  }

  @Patch(':id')
  @Roles([USER.ADMIN, USER.SALES])
  update(
    @Param('id', ParseObjectIdPipe) categoryId: ObjectId,
    @Body(new ZodValidationPipe(updateCategorySchema))
    updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update({
      categoryId,
      updateCategoryDto,
    });
  }

  @Delete(':id')
  @Roles([USER.ADMIN, USER.SALES])
  delete(@Param('id', ParseObjectIdPipe) categoryId: ObjectId) {
    return this.categoriesService.delete(categoryId);
  }
}
