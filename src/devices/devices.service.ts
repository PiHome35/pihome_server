import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device as DeviceEntity, DeviceDocument } from './schemas/device.schema';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { generateRandomSecret } from '../utils/random.util';
import { CreateDeviceParams, Device, DeviceWithSecret, UpdateDeviceParams } from './interfaces/device.interface';

@Injectable()
export class DevicesService {
  constructor(@InjectModel(DeviceEntity.name) private deviceModel: Model<DeviceDocument>) {}

  async create(createDeviceParams: CreateDeviceParams): Promise<DeviceWithSecret> {
    const clientSecret = generateRandomSecret();
    const newDevice = new this.deviceModel({
      clientId: createDeviceParams.clientId,
      clientSecretHash: await argon2.hash(clientSecret),
      name: createDeviceParams.name,
      familyId: createDeviceParams.familyId,
    });
    const savedDevice = await newDevice.save();
    return { ...savedDevice.toObject(), clientSecret };
  }

  async findOne(clientId: string): Promise<Device> {
    const device = await this.deviceModel.findOne({ _id: clientId }).exec();
    if (!device) {
      throw new NotFoundException(`Device with ID ${clientId} not found`);
    }
    return device.toObject();
  }

  async findAll(): Promise<Device[]> {
    const devices = await this.deviceModel.find().exec();
    return devices.map((device) => device.toObject());
  }

  async update(clientId: string, updateDeviceParams: UpdateDeviceParams): Promise<Device> {
    const oldDevice = await this.deviceModel.findOne({ _id: clientId }).exec();
    if (!oldDevice) {
      throw new NotFoundException(`Device with ID ${clientId} not found`);
    }
    const device = await this.deviceModel
      .findByIdAndUpdate(clientId, { $set: updateDeviceParams }, { new: true })
      .exec();
    return device!.toObject();
  }

  async remove(clientId: string): Promise<Device> {
    const device = await this.deviceModel.findByIdAndDelete(clientId).exec();
    if (!device) {
      throw new NotFoundException(`Device with ID ${clientId} not found`);
    }
    return device.toObject();
  }
}
