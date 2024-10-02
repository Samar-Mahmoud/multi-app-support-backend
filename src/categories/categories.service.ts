import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './category.schema';
import { Model, ObjectId, Types } from 'mongoose';
import { VendorsService } from '../vendors/vendors.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private vendorsService: VendorsService,
  ) {}

  /**
   * creates category documents
   * @param {CreateCategoryDto[]} createCategoryDto an array of objects that represent the data needed to create new categories
   * @returns if there are any errors during the creation process, an object containing the category name and error message
   * for each error will be returned. Otherwise, a success message will be returned
   */
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

  /**
   * retrieves all categories with an optional parent category ID filter for sub-categories
   * @param {ObjectId} [parentCategoryId] optional parameter to return the sub-categories of the `parentCategoryId` category
   * @returns if `parentCategoryId` is provided, the sub-categories of the `parentCategoryId` category will be returned.
   * Otherwise, all categories and subcategories will be returned
   */
  async findAll(parentCategoryId?: ObjectId) {
    // TODO: return categories as a tree
    return await this.categoryModel.find(
      parentCategoryId
        ? {
            parentCategoryId,
          }
        : {},
    );
  }

  /**
   * retrieves a category document by ID, along with its subcategories and associated vendors
   * @param {ObjectId} categoryId ID of the category document to find
   * @returns an object with three properties `category` the category found, `subCategories` array of the sub-categories
   * of the found category, and `vendors` array of vendors associated to the found category
   */
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

  /**
   * updates a category based on its ID
   * @param - an object with two properties `categoryId` ID of the category document to update and `updateCategoryDto`
   * the object that contains the data to update with
   * @returns a string value based on the result of updating a category in the database
   */
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

  /**
   * deletes a category and its related subcategories and vendors
   * @param {ObjectId} categoryId ID of the category document to delete
   * @returns a success message if the document is deleted. Otherwise, throws not found exception
   */
  async delete(categoryId: ObjectId) {
    try {
      const { deletedCount } = await this.categoryModel.deleteOne({
        _id: categoryId,
      });
      if (!deletedCount) {
        throw new NotFoundException(`category ${categoryId} not found`);
      }
      // delete subcategories
      await this.categoryModel.deleteMany({ parentCategoryId: categoryId });
      // delete category's vendors
      await this.vendorsService.deleteCategoryVendors(categoryId);
      return 'deleted successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
