import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
import { USER, USER_ROLES, USER_ROLES_ARR } from './users.types';
import { z } from 'zod';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles([USER.ADMIN, USER.TECH_SUPPORT])
  create(
    @Body(new ZodValidationPipe(createUserSchema)) createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles([USER.ADMIN, USER.TECH_SUPPORT])
  findAll() {
    return this.usersService.findAll();
  }

  @Get('info/:id')
  @Roles([USER.ADMIN, USER.TECH_SUPPORT])
  findOne(@Param('id', ParseObjectIdPipe) userId: ObjectId) {
    return this.usersService.findOne(userId);
  }

  @Get(':role')
  @Roles([USER.ADMIN, USER.TECH_SUPPORT])
  findRoleUsers(
    @Param('role', new ZodValidationPipe(z.enum(USER_ROLES_ARR)))
    userRole: USER_ROLES,
  ) {
    return this.usersService.findRoleUsers(userRole);
  }

  @Patch(':id')
  @Roles([USER.ADMIN, USER.TECH_SUPPORT])
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
  @Roles([USER.ADMIN])
  delete(@Param('id', ParseObjectIdPipe) userId: ObjectId) {
    return this.usersService.delete(userId);
  }
}
