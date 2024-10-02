import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { Model, ObjectId, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { hash, genSalt } from 'bcrypt';
import { USER_ROLES } from './users.types';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  private async hashPassword(password: string) {
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);
    return hashedPassword;
  }

  /**
   * creates a new user with hashed password and checks for duplicate email before saving
   * @param {CreateUserDto} createUserDto an object that contains the data needed to create a new user
   * @returns success message if the user is created. Otherwise, throws an exception
   */
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

  /**
   * retrieves all users with the role `userRole` while excluding the password field
   * @param {USER_ROLES} userRole the role of the users to find
   * @returns all user documents, excluding the `password` field
   */
  async findRoleUsers(userRole: USER_ROLES) {
    return await this.userModel.find({ role: userRole }, { password: 0 });
  }

  /**
   * retrieves all users while excluding the password
   * @returns all user documents, excluding the `password` field
   */
  async findAll() {
    return await this.userModel.find({}, { password: 0 });
  }

  /**
   * retrieves a user document by ID
   * @param {ObjectId} userId ID of the user document to find
   * @returns the found user, excluding the `password` field
   */
  async findOne(userId: ObjectId) {
    return await this.userModel.findById(userId, { password: 0 });
  }

  /**
   * finds a user by their email address
   * @param {string} email the user's email address used to search for a user in the database
   * @returns the found user document where the `email` field matches the provided `email`
   * parameter
   */
  async findOneByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  /**
   * updates a user based on its ID
   * @param - an object with two properties `userId` ID of the user document to update and `updateUserDto`
   * the object that contains the data to update with
   * @returns a success message if the document is updated. Otherwise, throws an exception
   */
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

  /**
   * deletes a user by its ID
   * @param {ObjectId} userId ID of the user document to delete
   * @returns a success message if the document is deleted. Otherwise, throws an exception
   */
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
