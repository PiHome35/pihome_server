import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User as UserEntity, UserDocument } from './schemas/user.schema';
import { User, CreateUserParams, UpdateUserParams } from './interfaces/user.interface';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(@InjectModel(UserEntity.name) private userModel: Model<UserDocument>) {}

  async create(createUserParams: CreateUserParams): Promise<User> {
    const newUser = new this.userModel({
      email: createUserParams.email,
      passwordHash: argon2.hash(createUserParams.password),
      name: createUserParams.name,
    });
    const savedUser = await newUser.save();
    return savedUser.toObject();
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().exec();
    return users.map((user) => user.toObject());
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.toObject();
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.toObject();
  }

  async updateById(id: string, updateUserParams: UpdateUserParams): Promise<User> {
    const oldUser = await this.userModel.findById(id).exec();
    if (!oldUser) {
      throw new NotFoundException('User not found');
    }
    const user = {
      email: updateUserParams.email ?? oldUser.email,
      passwordHash: updateUserParams.password ? argon2.hash(updateUserParams.password) : oldUser.passwordHash,
      name: updateUserParams.name ?? oldUser.name,
      familyId: updateUserParams.familyId ?? oldUser.familyId,
    };
    const updatedUser = await this.userModel.findByIdAndUpdate(id, { $set: user }, { new: true }).exec();
    return updatedUser!.toObject();
  }

  async updateByEmail(email: string, updateUserParams: UpdateUserParams): Promise<User> {
    const oldUser = await this.userModel.findOne({ email }).exec();
    if (!oldUser) {
      throw new NotFoundException('User not found');
    }
    const user = {
      email: updateUserParams.email ?? oldUser.email,
      name: updateUserParams.name ?? oldUser.name,
      passwordHash: updateUserParams.password ? argon2.hash(updateUserParams.password) : oldUser.passwordHash,
      familyId: updateUserParams.familyId ?? oldUser.familyId,
    };
    const updatedUser = await this.userModel.findOneAndUpdate({ email }, { $set: user }, { new: true }).exec();
    return updatedUser!.toObject();
  }

  async removeById(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return deletedUser.toObject();
  }

  async removeByEmail(email: string): Promise<User> {
    const deletedUser = await this.userModel.findOneAndDelete({ email }).exec();
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return deletedUser.toObject();
  }
}
