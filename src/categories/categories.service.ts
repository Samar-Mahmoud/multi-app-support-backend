import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './categories.schema';
import { Model, ObjectId, Document } from 'mongoose';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto[]) {
    try {
      const doc = await this.categoryModel.create(createCategoryDto);
      return doc;
    } catch (err) {
      return new BadRequestException(err.message);
    }
  }

  async findAll(parentCategoryId?: ObjectId) {
    return await this.categoryModel.find({
      parentCategoryId: parentCategoryId ?? null,
    });
  }

  async findOne(categoryId: ObjectId) {
    const doc = await this.categoryModel.findById(categoryId);
    return doc ?? 'not found';
  }

  async update({
    categoryId,
    updateCategoryDto,
  }: {
    categoryId: ObjectId;
    updateCategoryDto: UpdateCategoryDto;
  }) {
    try {
      return (await this.categoryModel.updateOne(
        { _id: categoryId },
        updateCategoryDto,
      )).matchedCount == 0 ? 'not found' : 'updated successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async delete(categoryId: ObjectId) {
    return (
      await this.categoryModel.deleteOne({
        _id: categoryId,
      })
    ).deletedCount === 0
      ? 'not found'
      : 'deleted successfully';
  }
}
