import { Body, Controller, Delete, Get, NotFoundException, Param, Put, Req } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DevicesService } from '../services/devices.service';
import { ListFamilyDevicesResponseDto } from '../dto/device/list-family-devices.dto';
import { ClientContext } from 'src/auth/interfaces/context.interface';
import { UsersService } from '../services/users.service';
import { FamiliesService } from '../services/families.service';
import { DeviceResponseDto } from '../dto/device.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateFamilyDeviceRequestDto } from '../dto/device/update-family-device.dto';

@ApiTags('Devices')
@Controller('me/family/devices')
export class DevicesController {
  constructor(
    private readonly usersService: UsersService,
    private readonly familiesService: FamiliesService,
    private readonly devicesService: DevicesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List devices in current user family' })
  @ApiOkResponse({ type: ListFamilyDevicesResponseDto })
  async listFamilyDevices(@Req() req: any): Promise<ListFamilyDevicesResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    return plainToInstance(ListFamilyDevicesResponseDto, {
      devices: await this.familiesService.listFamilyDevices(family.id),
    });
  }

  @Get(':deviceId')
  @ApiOperation({ summary: 'Get a device in current user family' })
  @ApiOkResponse({ type: DeviceResponseDto })
  async getFamilyDevice(@Req() req: any, @Param('deviceId') deviceId: string): Promise<DeviceResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const familyDevices = await this.familiesService.listFamilyDevices(family.id);
    const device = familyDevices.find((device) => device.id === deviceId);
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return plainToInstance(DeviceResponseDto, device);
  }

  @Put(':deviceId')
  @ApiOperation({ summary: 'Update a device in current user family' })
  @ApiOkResponse({ type: DeviceResponseDto })
  async updateFamilyDevice(
    @Req() req: any,
    @Param('deviceId') deviceId: string,
    @Body() body: UpdateFamilyDeviceRequestDto,
  ): Promise<DeviceResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const familyDevices = await this.familiesService.listFamilyDevices(family.id);
    const device = familyDevices.find((device) => device.id === deviceId);
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    const updatedDevice = await this.devicesService.updateDevice(deviceId, body.name);
    return plainToInstance(DeviceResponseDto, updatedDevice);
  }

  @Delete(':deviceId')
  @ApiOperation({ summary: 'Delete a device in current user family' })
  @ApiNoContentResponse()
  async deleteFamilyDevice(@Req() req: any, @Param('deviceId') deviceId: string): Promise<void> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const familyDevices = await this.familiesService.listFamilyDevices(family.id);
    const device = familyDevices.find((device) => device.id === deviceId);
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    await this.devicesService.deleteDevice(deviceId);
  }
}
