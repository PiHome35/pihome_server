import { Body, Controller, Delete, Get, Post, Req } from '@nestjs/common';
import { ApiBody, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SpotifyConnectionsService } from '../services/spotify-connections.service';
import {
  CreateFamilySpotifyConnectionRequestDto,
  CreateFamilySpotifyConnectionResponseDto,
} from '../dto/spotify-connection/create-family-spotify-connection.dto';
import { ClientContext } from 'src/auth/interfaces/context.interface';
import { UsersService } from '../services/users.service';
import { plainToInstance } from 'class-transformer';
import { GetFamilySpotifyConnectionResponseDto } from '../dto/spotify-connection/get-family-spotify-connection.dto';
import { FamiliesService } from '../services/families.service';

@ApiTags('Spotify Connections')
@Controller('me/family/spotify-connection')
export class SpotifyConnectionsController {
  constructor(
    private usersService: UsersService,
    private familiesService: FamiliesService,
    private spotifyConnectionsService: SpotifyConnectionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Connect Spotify account to current user family' })
  @ApiBody({ type: CreateFamilySpotifyConnectionRequestDto })
  @ApiOkResponse({ type: CreateFamilySpotifyConnectionResponseDto })
  async createFamilySpotifyConnection(
    @Req() req: any,
    @Body() body: CreateFamilySpotifyConnectionRequestDto,
  ): Promise<CreateFamilySpotifyConnectionResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const spotifyConnection = await this.spotifyConnectionsService.createSpotifyConnection(
      body.accessToken,
      body.refreshToken,
      body.expiresIn,
      body.spotifyDeviceId,
      family.id,
    );
    return plainToInstance(CreateFamilySpotifyConnectionResponseDto, spotifyConnection);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user family Spotify connection' })
  @ApiOkResponse({ type: GetFamilySpotifyConnectionResponseDto })
  async getFamilySpotifyConnection(@Req() req: any): Promise<GetFamilySpotifyConnectionResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const spotifyConnection = await this.familiesService.getFamilySpotifyConnection(family.id);
    return plainToInstance(GetFamilySpotifyConnectionResponseDto, spotifyConnection);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete current user family Spotify connection' })
  @ApiNoContentResponse()
  async deleteFamilySpotifyConnection(@Req() req: any): Promise<void> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const spotifyConnection = await this.familiesService.getFamilySpotifyConnection(family.id);
    await this.spotifyConnectionsService.deleteSpotifyConnection(spotifyConnection.id);
  }
}
