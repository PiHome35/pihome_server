import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Device as DeviceEntity, DeviceSchema } from './schemas/device.schema';
import { DevicesService } from './devices.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: DeviceEntity.name, schema: DeviceSchema }])],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
