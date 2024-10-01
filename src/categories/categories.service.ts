import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './categories.schema';
import { Model, ObjectId, Types } from 'mongoose';
import { VendorsService } from '../vendors/vendors.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private vendorsService: VendorsService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto[]) {
    const errors: { category: string; error: string }[] = [];

    for (const category of createCategoryDto) {
      try {
        if (category._id) {
          const doc = new this.categoryModel({
            ...category,
            _id: new Types.ObjectId(category._id),
          });
          await doc.save();
        } else {
          const doc = new this.categoryModel(category);
          await doc.save();
        }
      } catch (err) {
        errors.push({ category: category.name, error: err.message });
      }
    }
    return errors.length ? { errors } : 'created successfully';
  }

  async findAll(parentCategoryId?: ObjectId) {
    return await this.categoryModel.find(
      parentCategoryId
        ? {
            parentCategoryId,
          }
        : {},
    );
  }

  async findOne(categoryId: ObjectId) {
    const doc = await this.categoryModel.findById(categoryId);
    if (!doc) {
      throw new BadRequestException(`category ${categoryId} not found`);
    }
    const subCategories = await this.categoryModel.find(
      {
        parentCategoryId: categoryId,
      },
      {
        parentCategoryId: 0,
      },
    );
    const vendors = await this.vendorsService.findCategoryVendors(categoryId);
    return {
      category: doc,
      subCategories,
      vendors,
    };
  }

  async update({
    categoryId,
    updateCategoryDto,
  }: {
    categoryId: ObjectId;
    updateCategoryDto: UpdateCategoryDto;
  }) {
    try {
      return (
        await this.categoryModel.updateOne(
          { _id: categoryId },
          updateCategoryDto,
        )
      ).matchedCount == 0
        ? 'not found'
        : 'updated successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async delete(categoryId: ObjectId) {
    const { deletedCount } = await this.categoryModel.deleteOne({
      _id: categoryId,
    });
    if (!deletedCount) {
      throw new NotFoundException(`category ${categoryId} not found`);
    }
    try {
      await this.vendorsService.deleteCategoryVendors(categoryId);
      return 'deleted successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
