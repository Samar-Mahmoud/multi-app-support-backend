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
import { RequestUser } from '../auth/auth.types';
import { USER } from '../users/users.types';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
  ) {}

  /**
   * creates products for a specific vendor
   * @param {ObjectId} vendorId the vendor to whom the products will be associated
   * @param {CreateProductDto[]} createProductDto an array of objects containing data for creating products
   * @returns if there are any errors during the creation process, an object containing the product name and error message
   * for each error will be returned. Otherwise, a success message will be returned
   */
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

  /**
   * finds products belonging to a specific vendor based on the provided vendor ID
   * @param {ObjectId} [vendorId] - ID of the vendor to search for products associated with that specific vendor
   * @returns products belonging to the `vendorId` vendor
   */
  async findVendorProducts(vendorId: ObjectId) {
    return await this.productModel.find({ vendorId });
  }

  /**
   * retrieves a product by its ID
   * @param {ObjectId} productId ID of the product document to find
   * @returns the product document if found. Otherwise, throws a not found exception
   */
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

  /**
   * updates a product by is ID
   * @param - an object with two properties `productId` ID of the product document to update and `updateProductDto`
   * the object that contains the data to update with
   * @returns a success message if the document is updated. Otherwise, throws an exception
   */
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

  /**
   * deletes a product based on the product ID and user's role
   * @param {ObjectId} productId ID of the product document to delete
   * @param {RequestUser} user - an object contains the authorized user's ID and role
   * @returns a success message if the document is deleted. Otherwise, throws an exception
   */
  async delete(productId: ObjectId, user: RequestUser) {
    try {
      let deleted: boolean = false;
      if (user.userRole === USER.VENDOR) {
        const { deletedCount } = await this.productModel.deleteOne({
          _id: productId,
          vendorId: new Types.ObjectId(user.userId),
        });
        deleted = !!deletedCount;
      } else {
        const { deletedCount } = await this.productModel.deleteOne({
          _id: productId,
        });
        deleted = !!deletedCount;
      }
      return !deleted
        ? new NotFoundException(`product ${productId} not found`)
        : 'deleted successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  /**
   * deletes all products associated with a specific vendor ID
   * @param {Types.ObjectId | ObjectId} vendorId the vendor whose products need to be deleted
   */
  async deleteVendorProducts(vendorId: Types.ObjectId | ObjectId) {
    try {
      await this.productModel.deleteMany({ vendorId });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
