import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
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
import { UsersService } from '../services/users.service';
import { SpotifyConnectionsService } from '../services/spotify-connections.service';

@ApiTags('families')
@Controller('families')
export class FamiliesController {
  constructor(
    private familiesService: FamiliesService,
    private deviceGroupsService: DeviceGroupsService,
    private usersService: UsersService,
    private spotifyConnectionsService: SpotifyConnectionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a family' })
  @ApiBody({ type: CreateFamilyRequestDto })
  async createFamily(
    @Req() req: any,
    @Body() createFamilyDto: CreateFamilyRequestDto,
  ): Promise<CreateFamilyResponseDto> {
    const currentUser = req.user as UserContext;
    const family = await this.familiesService.createFamily(createFamilyDto.name, currentUser.sub);
    await this.deviceGroupsService.createDeviceGroup(DefaultDeviceGroupName, family.id, true);
    return { id: family.id };
  }

  @Post('/spotify-connection')
  @ApiOperation({ summary: 'Create a Spotify connection' })
  @ApiBody({ type: CreateSpotifyConnectionRequestDto })
  async createSpotifyConnection(
    @Req() req: any,
    @Body() createSpotifyConnectionDto: CreateSpotifyConnectionRequestDto,
  ): Promise<CreateSpotifyConnectionResponseDto> {
    const currentUser = req.user as UserContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const spotifyConnection = await this.spotifyConnectionsService.createSpotifyConnection(
      createSpotifyConnectionDto.accessToken,
      createSpotifyConnectionDto.refreshToken,
      new Date(createSpotifyConnectionDto.expiresAt * 1000),
      createSpotifyConnectionDto.spotifyDeviceId,
      currentUser.sub,
    );
    return { id: spotifyConnection.id };
  }
}
