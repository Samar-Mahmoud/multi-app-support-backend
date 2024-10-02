import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { USER_ROLES } from './users.types';
import { Model, ObjectId, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { hash, genSalt } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  private async hashPassword(password: string) {
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);
    return hashedPassword;
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, _id } = createUserDto;
    const doc = await this.userModel.findOne({ email });
    if (doc) {
      throw new BadRequestException('email is duplicated');
    }
    const hashedPassword = await this.hashPassword(password);
    try {
      if (_id) {
        const user = new this.userModel({
          ...createUserDto,
          password: hashedPassword,
          _id: new Types.ObjectId(_id),
        });
        await user.save();
      } else {
        const user = new this.userModel({
          ...createUserDto,
          password: hashedPassword,
        });
        await user.save();
      }
      return 'created successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async findRoleUsers(userRole: USER_ROLES) {
    return await this.userModel.find({ role: userRole }, { password: 0 });
  }

  async findAll() {
    return await this.userModel.find({}, { password: 0 });
  }

  async findOne(userId: ObjectId) {
    return await this.userModel.findById(userId, { password: 0 });
  }

  async findOneByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async update({
    userId,
    updateUserDto,
  }: {
    userId: ObjectId;
    updateUserDto: UpdateUserDto;
  }) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException(`user ${userId} not found`);
    }
    const { password } = updateUserDto;
    if (password) {
      updateUserDto.password = await this.hashPassword(password);
    }
    try {
      await this.userModel.updateOne({ _id: userId }, updateUserDto);
      return 'updated successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async delete(userId: ObjectId) {
    try {
      const { deletedCount } = await this.userModel.deleteOne({ _id: userId });
      return !deletedCount
        ? new NotFoundException(`user ${userId} not found`)
        : 'deleted successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
