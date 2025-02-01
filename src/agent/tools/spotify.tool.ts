import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { SpotifyService } from 'src/spotify/spotify.service';
import { SpotifyConnectionsService } from 'src/pihome/services/spotify-connections.service';

@Injectable()
export class SpotifyTool {
  private familyId: string;

  constructor(
    private spotifyService: SpotifyService,
    private spotifyConnectionsService: SpotifyConnectionsService,
  ) {}

  setFamilyId(familyId: string) {
    this.familyId = familyId;
    return this;
  }

  private async getDeviceId(familyId: string) {
    const spotifyConnection = await this.spotifyConnectionsService.getSpotifyConnectionByFamilyId(familyId);
    return spotifyConnection.spotifyDeviceId;
  }

  private playTrackSchema = z.object({
    trackUri: z.string().describe('The URI of the track to play'),
  });

  private searchTracksSchema = z.object({
    query: z.string().describe('The query to search for tracks'),
  });

  private queueTrackSchema = z.object({
    query: z.string().describe('The query to search for tracks'),
  });

  private playBackControlSchema = z.object({
    action: z.enum(['play', 'pause', 'next', 'previous', 'seek', 'volume']).describe('The action to perform'),
  });

  playTrack = tool(
    async (input: z.infer<typeof this.playTrackSchema>) => {
      const { trackUri } = input;
      const deviceId = await this.getDeviceId(this.familyId);
      await this.spotifyService.playTrack(this.familyId, trackUri, deviceId);
      return `Now playing: ${trackUri}`;
    },
    {
      name: 'playTrack',
      description: 'Play a specific song by name',
      schema: this.playTrackSchema,
    },
  );

  getFirstTrackUri = tool(
    async (input: z.infer<typeof this.searchTracksSchema>) => {
      const { query } = input;
      return await this.spotifyService.getFirstTrackUri(this.familyId, query);
    },
    {
      name: 'getFirstTrackUri',
      description: 'Get the URI of the first track that matches the query',
      schema: this.searchTracksSchema,
    },
  );

  queueTrack = tool(
    async (input: z.infer<typeof this.queueTrackSchema>) => {
      const { query } = input;
      return await this.spotifyService.queueTrack(this.familyId, query);
    },
    {
      name: 'queueTrack',
      description: 'Queue a track by name',
      schema: this.queueTrackSchema,
    },
  );

  playBackControl = tool(
    async (input: z.infer<typeof this.playBackControlSchema>) => {
      const { action } = input;
      const deviceId = await this.getDeviceId(this.familyId);

      let response;
      switch (action) {
        case 'play':
          await this.spotifyService.play(this.familyId, deviceId);
          response = 'Playback resumed';
          break;
        case 'pause':
          await this.spotifyService.pause(this.familyId, deviceId);
          response = 'Playback paused';
          break;
        case 'next':
          await this.spotifyService.next(this.familyId, deviceId);
          response = 'Skipped to next track';
          break;
        case 'previous':
          await this.spotifyService.previous(this.familyId, deviceId);
          response = 'Returned to previous track';
          break;
        default:
          response = 'Unknown action';
      }

      return response;
    },
    {
      name: 'playBackControl',
      description: 'Control the playback of the current track. Available actions: play, pause, next, previous',
      schema: this.playBackControlSchema,
    },
  );

  // seeQueue = tool(
  //   async (input: z.infer<typeof this.seeQueueSchema>) => {
  //     const { query } = input;
  //     return await this.spotifyService.seeQueue(this.familyId);
  //   },
  //   {
  //     name: 'seeQueue',
  //     description: 'See the current queue',
  //     schema: this.seeQueueSchema,
  //   },
  // );
}
