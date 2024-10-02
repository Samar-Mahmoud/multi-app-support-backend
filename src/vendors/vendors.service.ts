import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVendorDto, UpdateVendorDto } from './vendors.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Vendor } from './vendor.schema';
import { Model, ObjectId, Types } from 'mongoose';
import { Category } from '../categories/category.schema';
import { ProductsService } from '../products/products.service';

@Injectable()
export class VendorsService {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private productsService: ProductsService,
  ) {}

  /**
   * creates vendors for a specific category
   * @param {ObjectId} categoryId the category to whom the vendors will be associated
   * @param {CreateVendorDto[]} createVendorDto an array of objects containing data for creating vendors
   * @returns if there are any errors during the creation process, an object containing the vendor name and error message
   * for each error will be returned. Otherwise, a success message will be returned
   */
  async create(categoryId: ObjectId, createVendorDto: CreateVendorDto[]) {
    const errors: { vendor: string; error: string }[] = [];

    for (const vendor of createVendorDto) {
      const category = await this.categoryModel.findById(categoryId);
      if (!category) {
        errors.push({
          vendor: vendor.name,
          error: `category ${categoryId} not found`,
        });
        continue;
      }
      try {
        if (vendor._id) {
          const doc = new this.vendorModel({
            ...vendor,
            _id: new Types.ObjectId(vendor._id),
            categoryId,
          });
          await doc.save();
        } else {
          const doc = new this.vendorModel({
            ...vendor,
            categoryId,
          });
          await doc.save();
        }
      } catch (err) {
        errors.push({ vendor: vendor.name, error: err.message });
      }
    }
    return errors.length ? { errors } : 'created successfully';
  }

  /**
   * finds vendors belonging to a specific category based on the provided category ID
   * @param {ObjectId} [categoryId] - ID of the category to search for vendors associated with that specific category
   * @returns vendors belonging to the `categoryId` category
   */
  async findCategoryVendors(categoryId: ObjectId) {
    return await this.vendorModel.find({ categoryId });
  }

  /**
   * retrieves a vendor by its ID, along with its products
   * @param {ObjectId} vendorId ID of the vendor document to find
   * @returns an object with two properties `vendor` the vendor found and `products` array of products associated
   * to the found vendor
   */
  async findOne(vendorId: ObjectId) {
    const vendor = await this.vendorModel.findById(vendorId);
    if (!vendor) {
      throw new NotFoundException(`vendor ${vendorId} not found`);
    }
    const products = await this.productsService.findVendorProducts(vendorId);
    return {
      vendor,
      products,
    };
  }

  /**
   * updates a vendor based on its ID
   * @param - an object with two properties `vendorId` ID of the vendor document to update and `updateVendorDto`
   * the object that contains the data to update with
   * @returns a success message if the document is updated. Otherwise, throws an exception
   */
  async update({
    vendorId,
    updateVendorDto,
  }: {
    vendorId: ObjectId;
    updateVendorDto: UpdateVendorDto;
  }) {
    try {
      const { modifiedCount } = await this.vendorModel.updateOne(
        { _id: vendorId },
        updateVendorDto,
      );
      if (!modifiedCount) {
        throw new NotFoundException(`vendor ${vendorId} not found`);
      }
      return 'updated successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  /**
   * deletes a vendor by its ID
   * @param {ObjectId} vendorId ID of the vendor document to delete
   * @returns a success message if the document is deleted. Otherwise, throws an exception
   */
  async delete(vendorId: ObjectId) {
    const { deletedCount } = await this.vendorModel.deleteOne({
      _id: vendorId,
    });
    if (!deletedCount) {
      throw new NotFoundException(`vendor ${vendorId} not found`);
    }
    try {
      await this.productsService.deleteVendorProducts(vendorId);
      return 'deleted successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  /**
   * deletes all vendors associated with a specific category ID and products related to those vendors
   * @param {Types.ObjectId | ObjectId} categoryId the category whose vendors need to be deleted
   */
  async deleteCategoryVendors(categoryId: ObjectId) {
    const vendors = await this.vendorModel.find(
      { categoryId },
      { _id: 1, categoryId: 0, description: 0, location: 0, name: 0 },
    );
    for (const vendor of vendors) {
      try {
        await this.vendorModel.deleteOne({ _id: vendor._id });
        await this.productsService.deleteVendorProducts(vendor._id);
      } catch (err) {
        throw new BadRequestException(err.messge);
      }
    }
  }
}
