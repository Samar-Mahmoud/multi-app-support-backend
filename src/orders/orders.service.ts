import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto, UpdateOrderDto } from './orders.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { Model, ObjectId, Types } from 'mongoose';

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

  async findAll() {
    return await this.orderModel.find({});
  }

  async findOne(orderId: ObjectId) {
    return await this.orderModel.findById(orderId);
  }

  async update({
    orderId,
    updateOrderDto,
  }: {
    orderId: ObjectId;
    updateOrderDto: UpdateOrderDto;
  }) {
    const order = await this.findOne(orderId);
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

  async delete(orderId: ObjectId) {
    try {
      const { deletedCount } = await this.orderModel.deleteOne({ _id: orderId });
      return !deletedCount
        ? new NotFoundException(`order ${orderId} not found`)
        : 'deleted successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
