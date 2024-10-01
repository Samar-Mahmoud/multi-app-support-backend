import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVendorDto, UpdateVendorDto } from './vendors.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Vendor } from './vendors.schema';
import { Model, ObjectId, Types } from 'mongoose';
import { Category } from '../categories/categories.schema';
import { ProductsService } from '../products/products.service';

@Injectable()
export class VendorsService {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private productsService: ProductsService,
  ) {}

  async create(createVendorDto: CreateVendorDto[]) {
    const errors: { vendor: string; error: string }[] = [];

    for (const vendor of createVendorDto) {
      const category = await this.categoryModel.findById(vendor.categoryId);
      if (!category) {
        errors.push({
          vendor: vendor.name,
          error: `category ${vendor.categoryId} not found`,
        });
        continue;
      }
      try {
        if (vendor._id) {
          const doc = new this.vendorModel({
            ...vendor,
            _id: new Types.ObjectId(vendor._id),
            categoryId: new Types.ObjectId(vendor.categoryId),
          });
          await doc.save();
        } else {
          const doc = new this.vendorModel({
            ...vendor,
            categoryId: new Types.ObjectId(vendor.categoryId),
          });
          await doc.save();
        }
      } catch (err) {
        errors.push({ vendor: vendor.name, error: err.message });
      }
    }
    return errors.length ? { errors } : 'created successfully';
  }

  async findCategoryVendors(categoryId?: ObjectId) {
    return await this.vendorModel.find(categoryId ? { categoryId } : {});
  }

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
