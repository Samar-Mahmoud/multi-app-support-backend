import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, ObjectId } from 'mongoose';
import { ORDER, ORDER_STATUS } from './orders.type';
import { OrderProduct } from './orders.dto';

@Schema()
export class Order {
  @Prop({
    required: false,
  })
  description: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'Vendor',
  })
  vendorId: ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'User',
  })
  customerId: ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: false,
    ref: 'User',
  })
  riderId: ObjectId;

  @Prop({
    type: Types.Array<OrderProduct>,
    required: true,
  })
  products: OrderProduct[];

  @Prop({
    required: true,
  })
  price: number;

  @Prop({
    required: false,
    default: 'pending',
    enum: ORDER,
  })
  status: ORDER_STATUS;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
