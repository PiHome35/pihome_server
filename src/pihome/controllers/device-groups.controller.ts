import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeviceGroupsService } from '../services/device-groups.service';
import { DeviceGroupResponseDto } from '../dto/device-group.dto';
import { ClientContext } from 'src/auth/interfaces/context.interface';
import { CreateFamilyDeviceGroupRequestDto } from '../dto/device-group/create-family-device-group.dto';
import { UsersService } from '../services/users.service';
import { ListFamilyDeviceGroupsResponseDto } from '../dto/device-group/list-family-device-groups.dto';
import { FamiliesService } from '../services/families.service';
import { UpdateFamilyDeviceGroupRequestDto } from '../dto/device-group/update-family-device-group.dto';
import {
  AddFamilyDeviceGroupDevicesRequestDto,
  AddFamilyDeviceGroupDevicesResponseDto,
} from '../dto/device-group/add-family-device-group-devices.dto';
import {
  RemoveFamilyDeviceGroupDevicesRequestDto,
  RemoveFamilyDeviceGroupDevicesResponseDto,
} from '../dto/device-group/remove-family-device-group-devices.dto';
import { ListFamilyDeviceGroupDevicesResponseDto } from '../dto/device-group/list-family-device-group-devices.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('me/family/device-groups')
@ApiTags('Device Groups')
@UseGuards(JwtAuthGuard)
export class DeviceGroupsController {
  constructor(
    private usersService: UsersService,
    private familiesService: FamiliesService,
    private deviceGroupsService: DeviceGroupsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create device group in current user family' })
  @ApiCreatedResponse({ type: DeviceGroupResponseDto })
  async createDeviceGroup(
    @Req() req: any,
    @Body() body: CreateFamilyDeviceGroupRequestDto,
  ): Promise<DeviceGroupResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const deviceGroup = await this.deviceGroupsService.createDeviceGroup(body.name, family.id);
    return new DeviceGroupResponseDto(deviceGroup);
  }

  @Get()
  @ApiOperation({ summary: 'List device groups in current user family' })
  @ApiOkResponse({ type: ListFamilyDeviceGroupsResponseDto })
  async listFamilyDeviceGroups(@Req() req: any): Promise<ListFamilyDeviceGroupsResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const deviceGroups = await this.familiesService.listFamilyDeviceGroups(family.id);
    return new ListFamilyDeviceGroupsResponseDto({ deviceGroups });
  }

  @Get(':deviceGroupId')
  @ApiOperation({ summary: 'Get a device group in current user family' })
  @ApiOkResponse({ type: DeviceGroupResponseDto })
  async getFamilyDeviceGroup(
    @Req() req: any,
    @Param('deviceGroupId') deviceGroupId: string,
  ): Promise<DeviceGroupResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const familyDeviceGroups = await this.familiesService.listFamilyDeviceGroups(family.id);
    const deviceGroup = familyDeviceGroups.find((deviceGroup) => deviceGroup.id === deviceGroupId);
    if (!deviceGroup) {
      throw new NotFoundException('Device group not found');
    }
    return new DeviceGroupResponseDto(deviceGroup);
  }

  @Put(':deviceGroupId')
  @ApiOperation({ summary: 'Update a device group in current user family' })
  @ApiOkResponse({ type: DeviceGroupResponseDto })
  async updateFamilyDeviceGroup(
    @Req() req: any,
    @Param('deviceGroupId') deviceGroupId: string,
    @Body() body: UpdateFamilyDeviceGroupRequestDto,
  ): Promise<DeviceGroupResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const familyDeviceGroups = await this.familiesService.listFamilyDeviceGroups(family.id);
    const deviceGroup = familyDeviceGroups.find((deviceGroup) => deviceGroup.id === deviceGroupId);
    if (!deviceGroup) {
      throw new NotFoundException('Device group not found');
    }
    const updatedDeviceGroup = await this.deviceGroupsService.updateDeviceGroup(deviceGroupId, body.name);
    return new DeviceGroupResponseDto(updatedDeviceGroup);
  }

  @Delete(':deviceGroupId')
  @ApiOperation({ summary: 'Delete a device group in current user family' })
  @ApiNoContentResponse()
  async deleteFamilyDeviceGroup(@Req() req: any, @Param('deviceGroupId') deviceGroupId: string): Promise<void> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const familyDeviceGroups = await this.familiesService.listFamilyDeviceGroups(family.id);
    const deviceGroup = familyDeviceGroups.find((deviceGroup) => deviceGroup.id === deviceGroupId);
    if (!deviceGroup) {
      throw new NotFoundException('Device group not found');
    }
    await this.deviceGroupsService.deleteDeviceGroup(deviceGroupId);
  }

  @Post(':deviceGroupId/devices/add')
  @ApiOperation({ summary: 'Add devices to a device group in current user family' })
  @ApiOkResponse({ type: AddFamilyDeviceGroupDevicesResponseDto })
  async addDevicesToDeviceGroup(
    @Req() req: any,
    @Param('deviceGroupId') deviceGroupId: string,
    @Body() body: AddFamilyDeviceGroupDevicesRequestDto,
  ): Promise<AddFamilyDeviceGroupDevicesResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const familyDeviceGroups = await this.familiesService.listFamilyDeviceGroups(family.id);
    const deviceGroup = familyDeviceGroups.find((deviceGroup) => deviceGroup.id === deviceGroupId);
    if (!deviceGroup) {
      throw new NotFoundException('Device group not found');
    }
    const devices = await this.deviceGroupsService.addDevicesToDeviceGroup(deviceGroupId, body.deviceIds);
    return new AddFamilyDeviceGroupDevicesResponseDto({ devices });
  }

  @Get(':deviceGroupId/devices')
  @ApiOperation({ summary: 'List devices in a device group in current user family' })
  @ApiOkResponse({ type: ListFamilyDeviceGroupDevicesResponseDto })
  async listDeviceGroupDevices(
    @Req() req: any,
    @Param('deviceGroupId') deviceGroupId: string,
  ): Promise<ListFamilyDeviceGroupDevicesResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const familyDeviceGroups = await this.familiesService.listFamilyDeviceGroups(family.id);
    const deviceGroup = familyDeviceGroups.find((deviceGroup) => deviceGroup.id === deviceGroupId);
    if (!deviceGroup) {
      throw new NotFoundException('Device group not found');
    }
    const devices = await this.deviceGroupsService.listDeviceGroupDevices(deviceGroupId);
    return new ListFamilyDeviceGroupDevicesResponseDto({ devices });
  }

  @Post(':deviceGroupId/devices/remove')
  @ApiOperation({ summary: 'Remove devices from a device group in current user family' })
  @ApiOkResponse({ type: RemoveFamilyDeviceGroupDevicesResponseDto })
  async removeDevicesFromDeviceGroup(
    @Req() req: any,
    @Param('deviceGroupId') deviceGroupId: string,
    @Body() body: RemoveFamilyDeviceGroupDevicesRequestDto,
  ): Promise<RemoveFamilyDeviceGroupDevicesResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const familyDeviceGroups = await this.familiesService.listFamilyDeviceGroups(family.id);
    const deviceGroup = familyDeviceGroups.find((deviceGroup) => deviceGroup.id === deviceGroupId);
    if (!deviceGroup) {
      throw new NotFoundException('Device group not found');
    }
    const devices = await this.deviceGroupsService.removeDevicesFromDeviceGroup(deviceGroupId, body.deviceIds);
    return new RemoveFamilyDeviceGroupDevicesResponseDto({ devices });
  }
}
