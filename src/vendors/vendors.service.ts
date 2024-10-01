import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVendorDto, UpdateVendorDto } from './vendors.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Vendor } from './vendors.schema';
import { Model, ObjectId } from 'mongoose';
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
      } else {
        try {
          const doc = new this.vendorModel(vendor);
          await doc.save();
        } catch (err) {
          errors.push({ vendor: vendor.name, error: err.message });
        }
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
    const products = this.productsService.findVendorProducts(vendorId);
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

  // TODO: delete products
  async delete(vendorId: ObjectId) {
    return (
      await this.vendorModel.deleteOne({
        _id: vendorId,
      })
    ).deletedCount === 0
      ? new NotFoundException(`vendor ${vendorId} not found`)
      : 'deleted successfully';
  }
}
