import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  createOrderSchema,
  UpdateOrderDto,
  updateOrderSchema,
} from './orders.dto';
import { ZodValidationPipe } from '../pipes/validation.pipe';
import { ParseObjectIdPipe } from '../pipes/objectId.pipe';
import { ObjectId } from 'mongoose';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createOrderSchema))
    createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    // TODO: return orders based on current user's role
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) orderId: ObjectId) {
    return this.ordersService.findOne(orderId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) orderId: ObjectId,
    @Body(new ZodValidationPipe(updateOrderSchema))
    updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update({ orderId, updateOrderDto });
  }

  @Delete(':id')
  delete(@Param('id', ParseObjectIdPipe) orderId: ObjectId) {
    return this.ordersService.delete(orderId);
  }
}
