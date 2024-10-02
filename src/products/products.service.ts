import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './products.dto';
import { Model, Types, ObjectId } from 'mongoose';
import { Product } from './product.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Vendor } from '../vendors/vendor.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
  ) {}

  async create(vendorId: ObjectId, createProductDto: CreateProductDto[]) {
    const errors: { product: string; error: string }[] = [];

    for (const product of createProductDto) {
      const vendor = await this.vendorModel.findById(vendorId);
      if (!vendor) {
        errors.push({
          product: product.name,
          error: `vendor ${vendorId} not found`,
        });
      } else {
        try {
          if (product._id) {
            const doc = new this.productModel({
              ...product,
              _id: new Types.ObjectId(product._id),
              vendorId,
            });
            await doc.save();
          } else {
            const doc = new this.productModel({
              ...product,
              vendorId,
            });
            await doc.save();
          }
        } catch (err) {
          errors.push({ product: product.name, error: err.message });
        }
      }
    }
    return errors.length ? { errors } : 'created successfully';
  }

  async findVendorProducts(vendorId?: ObjectId) {
    return await this.productModel.find(vendorId ? { vendorId } : {});
  }

  async findOne(productId: ObjectId) {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException(`product ${productId} not found`);
    }
    // TODO: return product's reviews
    return {
      product,
    };
  }

  async update({
    productId,
    updateProductDto,
  }: {
    productId: ObjectId;
    updateProductDto: UpdateProductDto;
  }) {
    try {
      const { modifiedCount } = await this.productModel.updateOne(
        { _id: productId },
        updateProductDto,
      );
      if (!modifiedCount) {
        throw new NotFoundException(`product ${productId} not found`);
      }
      return 'updated successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async delete(productId: ObjectId) {
    try {
      const { deletedCount } = await this.productModel.deleteOne({
        _id: productId,
      });
      return !deletedCount
        ? new NotFoundException(`product ${productId} not found`)
        : 'deleted successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async deleteVendorProducts(vendorId: Types.ObjectId | ObjectId) {
    try {
      await this.productModel.deleteMany({ vendorId });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
