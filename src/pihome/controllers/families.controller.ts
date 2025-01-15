import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FamiliesService } from '../services/families.service';
import { CreateFamilyResponseDto } from '../dto/create-family.dto';
import { CreateFamilyRequestDto } from '../dto/create-family.dto';
import { UserContext } from 'src/auth/interfaces/context.interface';
import { DefaultDeviceGroupName } from '../constants/device-group.constant';
import { DeviceGroupsService } from '../services/device-groups.service';

@ApiTags('families')
@Controller('families')
export class FamiliesController {
  constructor(
    private familiesService: FamiliesService,
    private deviceGroupsService: DeviceGroupsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a family' })
  @ApiBody({ type: CreateFamilyRequestDto })
  @ApiResponse({ status: 200, description: 'Family created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createFamily(
    @Req() req: any,
    @Body() createFamilyDto: CreateFamilyRequestDto,
  ): Promise<CreateFamilyResponseDto> {
    const currentUser = req.user as UserContext;
    const family = await this.familiesService.createFamily(createFamilyDto.name, currentUser.sub);
    await this.deviceGroupsService.createDeviceGroup(DefaultDeviceGroupName, family.id, true);
    return { id: family.id };
  }
}
