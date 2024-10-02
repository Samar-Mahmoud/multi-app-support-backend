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

  async delete(orderId: ObjectId, user: RequestUser) {
    try {
      if (user.userRole === USER.ADMIN) {
        const { deletedCount } = await this.orderModel.deleteOne({
          _id: orderId,
        });
        return !deletedCount
          ? new NotFoundException(`order ${orderId} not found`)
          : 'deleted successfully';
      } else {
        const { deletedCount } = await this.orderModel.deleteOne({
          _id: orderId,
          vendorId: new Types.ObjectId(user.userId),
        });
        return !deletedCount
          ? new NotFoundException(`order ${orderId} not found`)
          : 'deleted successfully';
      }
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
