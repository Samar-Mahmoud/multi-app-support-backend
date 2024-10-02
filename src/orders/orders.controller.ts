import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
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
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { USER } from '../users/users.types';
import { AuthedRequest } from '../auth/auth.types';

@UseGuards(JwtGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles([USER.CUSTOMER])
  create(
    @Body(new ZodValidationPipe(createOrderSchema))
    createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @Roles([USER.ADMIN, USER.CUSTOMER, USER.VENDOR, USER.RIDER])
  findAll(@Req() req: AuthedRequest) {
    return this.ordersService.findAll(req.user);
  }

  @Get(':id')
  @Roles([USER.ADMIN, USER.CUSTOMER, USER.VENDOR, USER.RIDER])
  findOne(
    @Param('id', ParseObjectIdPipe) orderId: ObjectId,
    @Req() req: AuthedRequest,
  ) {
    return this.ordersService.findOne(orderId, req.user);
  }

  @Patch(':id')
  @Roles([USER.ADMIN, USER.CUSTOMER, USER.VENDOR, USER.RIDER])
  update(
    @Param('id', ParseObjectIdPipe) orderId: ObjectId,
    @Body(new ZodValidationPipe(updateOrderSchema))
    updateOrderDto: UpdateOrderDto,
    @Req() req: AuthedRequest,
  ) {
    return this.ordersService.update({ orderId, updateOrderDto }, req.user);
  }

  @Delete(':id')
  @Roles([USER.ADMIN, USER.VENDOR, USER.CUSTOMER])
  delete(
    @Param('id', ParseObjectIdPipe) orderId: ObjectId,
    @Req() req: AuthedRequest,
  ) {
    return this.ordersService.delete(orderId, req.user);
  }
}
