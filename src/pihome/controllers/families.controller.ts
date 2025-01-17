import { Body, Controller, Delete, Get, Post, Req } from '@nestjs/common';
import { ApiBody, ApiNoContentResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FamiliesService } from '../services/families.service';
import { CreateFamilyResponseDto } from '../dto/create-family.dto';
import { CreateFamilyRequestDto } from '../dto/create-family.dto';
import { UserContext } from 'src/auth/interfaces/context.interface';
import { DefaultDeviceGroupName } from '../constants/device-group.constant';
import { DeviceGroupsService } from '../services/device-groups.service';
import {
  CreateSpotifyConnectionRequestDto,
  CreateSpotifyConnectionResponseDto,
} from '../dto/create-spotify-connection.dto';
import { SpotifyConnectionsService } from '../services/spotify-connections.service';
import { CreateFamilyInviteCodeResponseDto } from '../dto/create-family-invite-code.dto';

@ApiTags('families')
@Controller('families')
export class FamiliesController {
  constructor(
    private familiesService: FamiliesService,
    private deviceGroupsService: DeviceGroupsService,
    private spotifyConnectionsService: SpotifyConnectionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a family' })
  @ApiBody({ type: CreateFamilyRequestDto })
  @ApiResponse({ type: CreateFamilyResponseDto })
  async createFamily(
    @Req() req: any,
    @Body() createFamilyDto: CreateFamilyRequestDto,
  ): Promise<CreateFamilyResponseDto> {
    const currentUser = req.user as UserContext;
    const family = await this.familiesService.createFamily(createFamilyDto.name, currentUser.sub);
    await this.deviceGroupsService.createDeviceGroup(DefaultDeviceGroupName, family.id);
    return { id: family.id };
  }

  @Post('invite-code')
  @ApiOperation({ summary: 'Create a family invite code' })
  @ApiResponse({ type: CreateFamilyInviteCodeResponseDto })
  async createFamilyInviteCode(@Req() req: any): Promise<CreateFamilyInviteCodeResponseDto> {
    const currentUser = req.user as UserContext;
    const inviteCode = await this.familiesService.createFamilyInviteCode(currentUser.sub);
    return { code: inviteCode };
  }

  @Delete('invite-code')
  @ApiOperation({ summary: 'Delete a family invite code' })
  @ApiNoContentResponse()
  @ApiResponse({ status: 204 })
  async deleteFamilyInviteCode(@Req() req: any): Promise<void> {
    const currentUser = req.user as UserContext;
    await this.familiesService.deleteFamilyInviteCode(currentUser.sub);
  }

  @Post('spotify-connection')
  @ApiOperation({ summary: 'Create a family Spotify connection' })
  @ApiBody({ type: CreateSpotifyConnectionRequestDto })
  @ApiResponse({ type: CreateSpotifyConnectionResponseDto })
  async createSpotifyConnection(
    @Req() req: any,
    @Body() createSpotifyConnectionDto: CreateSpotifyConnectionRequestDto,
  ): Promise<CreateSpotifyConnectionResponseDto> {
    const currentUser = req.user as UserContext;
    const spotifyConnection = await this.spotifyConnectionsService.createSpotifyConnection(
      createSpotifyConnectionDto.accessToken,
      createSpotifyConnectionDto.refreshToken,
      createSpotifyConnectionDto.expiresIn,
      new Date(),
      createSpotifyConnectionDto.spotifyDeviceId,
      currentUser.sub,
    );
    return { id: spotifyConnection.id };
  }
}
