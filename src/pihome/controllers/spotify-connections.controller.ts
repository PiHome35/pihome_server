import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SpotifyConnectionsService } from '../services/spotify-connections.service';
import { CreateFamilySpotifyConnectionRequestDto } from '../dto/spotify-connection/create-family-spotify-connection.dto';
import { ClientContext } from 'src/auth/interfaces/context.interface';
import { UsersService } from '../services/users.service';
import { FamiliesService } from '../services/families.service';
import { SpotifyConnectionResponseDto } from '../dto/spotify-connection.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('me/family/spotify-connection')
@ApiTags('Spotify Connections')
@UseGuards(JwtAuthGuard)
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
    return new SpotifyConnectionResponseDto(spotifyConnection);
  }

  @Get()
  @ApiOperation({ summary: 'Get Spotify connection of current user family' })
  @ApiOkResponse({ type: SpotifyConnectionResponseDto })
  async getFamilySpotifyConnection(@Req() req: any): Promise<SpotifyConnectionResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const spotifyConnection = await this.familiesService.getFamilySpotifyConnection(family.id);
    return new SpotifyConnectionResponseDto(spotifyConnection);
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
