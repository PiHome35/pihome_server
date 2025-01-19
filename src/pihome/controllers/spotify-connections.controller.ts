import { Body, Controller, Delete, Get, Post, Req } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SpotifyConnectionsService } from '../services/spotify-connections.service';
import { CreateFamilySpotifyConnectionRequestDto } from '../dto/spotify-connection/create-family-spotify-connection.dto';
import { ClientContext } from 'src/auth/interfaces/context.interface';
import { UsersService } from '../services/users.service';
import { plainToInstance } from 'class-transformer';
import { FamiliesService } from '../services/families.service';
import { SpotifyConnectionResponseDto } from '../dto/spotify-connection.dto';

@ApiTags('Spotify Connections')
@Controller('me/family/spotify-connection')
export class SpotifyConnectionsController {
  constructor(
    private usersService: UsersService,
    private familiesService: FamiliesService,
    private spotifyConnectionsService: SpotifyConnectionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Spotify connection for current user family' })
  @ApiCreatedResponse({ type: SpotifyConnectionResponseDto })
  async createFamilySpotifyConnection(
    @Req() req: any,
    @Body() body: CreateFamilySpotifyConnectionRequestDto,
  ): Promise<SpotifyConnectionResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const spotifyConnection = await this.spotifyConnectionsService.createSpotifyConnection(
      body.accessToken,
      body.refreshToken,
      body.expiresIn,
      body.spotifyDeviceId,
      family.id,
    );
    return plainToInstance(SpotifyConnectionResponseDto, spotifyConnection);
  }

  @Get()
  @ApiOperation({ summary: 'Get Spotify connection of current user family' })
  @ApiOkResponse({ type: SpotifyConnectionResponseDto })
  async getFamilySpotifyConnection(@Req() req: any): Promise<SpotifyConnectionResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const spotifyConnection = await this.familiesService.getFamilySpotifyConnection(family.id);
    return plainToInstance(SpotifyConnectionResponseDto, spotifyConnection);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete Spotify connection of current user family' })
  @ApiNoContentResponse()
  async deleteFamilySpotifyConnection(@Req() req: any): Promise<void> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const spotifyConnection = await this.familiesService.getFamilySpotifyConnection(family.id);
    await this.spotifyConnectionsService.deleteSpotifyConnection(spotifyConnection.id);
  }
}
