import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto, UpdateOrderDto } from './orders.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { Model, ObjectId, Types } from 'mongoose';
import { RequestUser } from '../auth/auth.types';
import { USER } from '../users/users.types';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  /**
   * creates a new order
   * @param {CreateOrderDto} createOrderDto  an object that contains the data needed to create a new order
   * @returns success message if the order is created. Otherwise, throws an exception
   */
  async create(createOrderDto: CreateOrderDto) {
    try {
      if (createOrderDto._id) {
        const order = new this.orderModel({
          ...createOrderDto,
          _id: new Types.ObjectId(createOrderDto._id),
        });
        await order.save();
      } else {
        const order = new this.orderModel(createOrderDto);
        await order.save();
      }
      return 'created successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  /**
   * finds orders based on the user's role
   * @param {RequestUser} - an object contains the authorized user's ID and role
   * @returns orders based on the user's role.
   * If the user is an admin, it returns all orders.
   * If the user is a customer, it returns customer's orders.
   * If the user is a vendor, it returns orders associated with the vendor.
   * If the user is a rider, it returns orders assigned to the rider.
   */
  async findAll({ userId, userRole }: RequestUser) {
    if (userRole === USER.ADMIN) {
      return await this.orderModel.find({});
    } else if (userRole === USER.CUSTOMER) {
      return await this.orderModel.find({ customerId: userId });
    } else if (userRole === USER.VENDOR) {
      return await this.orderModel.find({ vendorId: userId });
    } else {
      return await this.orderModel.find({ riderId: userId });
    }
  }

  /**
   * finds an order based on the user's role
   * @param {ObjectId} orderId - ID of the order document to find
   * @param {RequestUser} - an object contains the authorized user's ID and role
   * @returns a specific order based on the user's role.
   * If the user is an admin, it returns the found order.
   * If the user is a customer, it returns customer's order with `orderId` ID.
   * If the user is a vendor, it returns the order associated with the vendor and with `orderId` ID.
   * If the user is a rider, it return the order assigned to the rider and with `orderId` ID.
   */
  async findOne(orderId: ObjectId, { userId, userRole }: RequestUser) {
    const id = new Types.ObjectId(userId);
    if (userRole === USER.ADMIN) {
      return await this.orderModel.findById(orderId);
    } else if (userRole === USER.CUSTOMER) {
      return await this.orderModel.findOne({ _id: orderId, customerId: id });
    } else if (userRole === USER.VENDOR) {
      return await this.orderModel.findOne({ _id: orderId, vendorId: id });
    } else {
      return await this.orderModel.findOne({ _id: orderId, riderId: id });
    }
  }

  /**
   * updates an order
   * @param - an object with two properties `orderId` ID of the order document to update and `updateOrderDto`
   * the object that contains the data to update with
   * @param {RequestUser} user - an object contains the authorized user's ID and role
   * @returns a success message if the document is updated. Otherwise, throws an exception
   */
  async update(
    {
      orderId,
      updateOrderDto,
    }: {
      orderId: ObjectId;
      updateOrderDto: UpdateOrderDto;
    },
    user: RequestUser,
  ) {
    const order = await this.findOne(orderId, user);
    if (!order) {
      throw new NotFoundException(`order ${orderId} not found`);
    }
    try {
      await this.orderModel.updateOne({ _id: orderId }, updateOrderDto);
      return 'updated successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  /**
   * deletes an order based on the orderId and user's role
   * @param {ObjectId} orderId ID of the order document to delete
   * @param {RequestUser} user - an object contains the authorized user's ID and role
   * @returns a success message if the document is updated. Otherwise, throws an exception
   */
  async delete(orderId: ObjectId, user: RequestUser) {
    try {
      let deleted: boolean = false;
      if (user.userRole === USER.ADMIN) {
        const { deletedCount } = await this.orderModel.deleteOne({
          _id: orderId,
        });
        deleted = !!deletedCount;
      } else if (user.userRole === USER.VENDOR) {
        const { deletedCount } = await this.orderModel.deleteOne({
          _id: orderId,
          vendorId: new Types.ObjectId(user.userId),
        });
        deleted = !!deletedCount;
      } else {
        const { deletedCount } = await this.orderModel.deleteOne({
          _id: orderId,
          customerId: new Types.ObjectId(user.userId),
        });
        deleted = !!deletedCount;
      }
      return !deleted
        ? new NotFoundException(`order ${orderId} not found`)
        : 'deleted successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
