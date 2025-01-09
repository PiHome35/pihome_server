import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Family as FamilyEntity, FamilyDocument } from './schemas/family.schema';
import { Family, CreateFamilyParams, UpdateFamilyParams } from './interfaces/family.interface';

@Injectable()
export class FamiliesService {
  constructor(@InjectModel(FamilyEntity.name) private familyModel: Model<FamilyDocument>) {}

  async create(createFamilyParams: CreateFamilyParams): Promise<Family> {
    const newFamily = new this.familyModel(createFamilyParams);
    const savedFamily = await newFamily.save();
    return savedFamily.toObject();
  }

  async findAll(): Promise<Family[]> {
    const families = await this.familyModel.find().exec();
    return families.map((family) => family.toObject());
  }

  async findOne(id: string): Promise<Family> {
    const family = await this.familyModel.findById(id).exec();
    if (!family) {
      throw new NotFoundException(`Family with ID ${id} not found`);
    }
    return family.toObject();
  }

  async update(id: string, updateFamilyParams: UpdateFamilyParams): Promise<Family> {
    const oldFamily = await this.familyModel.findById(id).exec();
    if (!oldFamily) {
      throw new NotFoundException(`Family with ID ${id} not found`);
    }
    const family = {
      name: updateFamilyParams.name ?? oldFamily.name,
      ownerUserId: updateFamilyParams.ownerUserId ?? oldFamily.ownerUserId,
      userIds: updateFamilyParams.userIds ?? oldFamily.userIds,
      deviceIds: updateFamilyParams.deviceIds ?? oldFamily.deviceIds,
    };
    const updatedFamily = await this.familyModel.findByIdAndUpdate(id, { $set: family }, { new: true }).exec();
    return updatedFamily!.toObject();
  }

  async remove(id: string): Promise<Family> {
    const deletedFamily = await this.familyModel.findByIdAndDelete(id).exec();
    if (!deletedFamily) {
      throw new NotFoundException(`Family with ID ${id} not found`);
    }
    return deletedFamily.toObject();
  }
}
