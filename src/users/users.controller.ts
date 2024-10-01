import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  createUserSchema,
  UpdateUserDto,
  updateUserSchema,
} from './users.dto';
import { ZodValidationPipe } from 'src/pipes/validation.pipe';
import { ObjectId } from 'mongoose';
import { ParseObjectIdPipe } from 'src/pipes/objectId.pipe';
import { USER, USER_ROLES } from './users.types';
import { z } from 'zod';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createUserSchema)) createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto);
  }

  @Get('info/:id')
  findOne(@Param('id', ParseObjectIdPipe) userId: ObjectId) {
    return this.usersService.findOne(userId);
  }

  @Get(':role')
  findAll(
    @Param('role', new ZodValidationPipe(z.enum(USER))) userRole: USER_ROLES,
  ) {
    return this.usersService.findAll(userRole);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) userId: ObjectId,
    @Body(new ZodValidationPipe(updateUserSchema)) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update({
      userId,
      updateUserDto,
    });
  }

  @Delete(':id')
  delete(@Param('id', ParseObjectIdPipe) userId: ObjectId) {
    return this.usersService.delete(userId);
  }
}
