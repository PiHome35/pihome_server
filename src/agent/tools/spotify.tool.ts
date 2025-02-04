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

  getAllTools(familyId: string) {
    this.setFamilyId(familyId);
    return [
      this.playTrack,
      this.getFirstTrackUri,
      this.playBackControl,
      this.queueTrack,
      this.getQueue,
      this.transferPlayback,
      this.searchTrackDetails,
    ];
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
    trackUri: z.string().describe('The URI of the track to add to the queue'),
  });

  private playBackControlSchema = z.object({
    action: z.enum(['play', 'pause', 'next', 'previous', 'seek', 'volume']).describe('The action to perform'),
    volumePercent: z.number().optional().describe('Volume level between 0 and 100 (only used with volume action)'),
  });

  private transferPlaybackSchema = z.object({
    deviceId: z.string().describe('The ID of the device to transfer playback to'),
    startPlayback: z.boolean().optional().describe('Whether to start playback after transfer (default: false)'),
  });

  private getQueueSchema = z.object({
    dummy: z.string().optional().describe('Optional parameter, not used'),
  });

  private searchTrackDetailsSchema = z.object({
    query: z.string().describe('The search query for the track if user not want to play it'),
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
      const { trackUri } = input;
      await this.spotifyService.queueTrack(this.familyId, trackUri);
      try {
        // Get initial queue state
        const initialQueue = await this.spotifyService.seeQueue(this.familyId);

        // Attempt to add track to queue
        await this.spotifyService.queueTrack(this.familyId, trackUri);

        // Get track details for response
        const trackName = await this.spotifyService.getSongName(this.familyId, trackUri);
        const artists = await this.spotifyService.getArtists(this.familyId, trackUri);

        // Verify track was added by checking updated queue
        const updatedQueue = await this.spotifyService.seeQueue(this.familyId);

        // Check if the track appears in the updated queue but not in the initial queue
        const trackWasAdded =
          updatedQueue.queue.some(
            (track) => track.name === trackName && track.artists.join(',') === artists.join(','),
          ) &&
          !initialQueue.queue.some(
            (track) => track.name === trackName && track.artists.join(',') === artists.join(','),
          );

        if (trackWasAdded) {
          return `I've added "${trackName}" by ${artists.join(' and ')} to your queue. It will play after the current song.`;
        } else {
          return 'The track was not successfully added to the queue. Please make sure Spotify is running and try again.';
        }
      } catch (error) {
        // Check specific error cases
        if (error.message.includes('No active device found')) {
          return "I couldn't add the song to the queue because there's no active Spotify device. Please start playing Spotify on a device first.";
        } else if (error.message.includes('Premium')) {
          return "I couldn't add the song to the queue because this feature requires Spotify Premium.";
        }

        // For other errors, try to check the queue anyway
        try {
          const currentQueue = await this.spotifyService.seeQueue(this.familyId);
          const trackName = await this.spotifyService.getSongName(this.familyId, trackUri);
          const artists = await this.spotifyService.getArtists(this.familyId, trackUri);

          if (
            currentQueue.queue.some(
              (track) => track.name === trackName && track.artists.join(',') === artists.join(','),
            )
          ) {
            return `Good news! Despite an error, "${trackName}" by ${artists.join(' and ')} appears to be in your queue.`;
          }
        } catch (queueError) {
          console.error('Error checking queue:', queueError);
        }

        return "I wasn't able to add the song to the queue or verify if it was added. Please check your Spotify app.";
      }
    },
    {
      name: 'queueTrack',
      description: 'add Music to the queue by query',
      schema: this.queueTrackSchema,
    },
  );

  playBackControl = tool(
    async (input: z.infer<typeof this.playBackControlSchema>) => {
      const { action, volumePercent } = input;
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
        case 'volume':
          if (volumePercent === undefined) {
            response = 'Volume percent must be specified for volume control';
            break;
          }
          await this.spotifyService.setVolume(this.familyId, volumePercent, deviceId);
          response = `Volume set to ${volumePercent}%`;
          break;
        default:
          response = 'Unknown action';
      }

      return response;
    },
    {
      name: 'playBackControl',
      description:
        'Control the playback of the current track. Available actions: play, pause, next, previous, volume. For volume control, specify volumePercent between 0 and 100',
      schema: this.playBackControlSchema,
    },
  );

  getQueue = tool(
    async () => {
      const queue = await this.spotifyService.seeQueue(this.familyId);
      let response = '';

      if (queue.currentlyPlaying) {
        response += `Currently playing: ${queue.currentlyPlaying.name} by ${queue.currentlyPlaying.artists.join(', ')}\n\n`;
      }

      if (queue.queue.length > 0) {
        response += 'Up next:\n';
        queue.queue.forEach((track, index) => {
          if (index < 5) {
            // Only show first 5 tracks in queue
            response += `${index + 1}. ${track.name} by ${track.artists.join(', ')}\n`;
          }
        });
      } else {
        response += 'Queue is empty';
      }

      return response;
    },
    {
      name: 'getQueue',
      description: 'Get the current queue of music from Spotify',
      schema: this.getQueueSchema,
    },
  );

  transferPlayback = tool(
    async (input: z.infer<typeof this.transferPlaybackSchema>) => {
      try {
        const { deviceId, startPlayback = false } = input;
        await this.spotifyService.transferPlayback(this.familyId, deviceId, startPlayback);
        return `Successfully transferred playback to device ${deviceId}${startPlayback ? ' and started playback' : ''}`;
      } catch (error) {
        return `Failed to transfer playback: ${error.message}`;
      }
    },
    {
      name: 'transferPlayback',
      description: 'Transfer Spotify playback to a specific device. Optionally start playback after transfer.',
      schema: this.transferPlaybackSchema,
    },
  );

  searchTrackDetails = tool(
    async (input: z.infer<typeof this.searchTrackDetailsSchema>) => {
      const { query } = input;
      const tracks = await this.spotifyService.searchTracks(this.familyId, query);

      if (!tracks || tracks.length === 0) {
        return 'No tracks found matching your query.';
      }

      // Get the first track (most relevant match)
      const track = tracks[0];

      // Format duration into minutes and seconds
      const minutes = Math.floor(track.duration_ms / 1000 / 60);
      const seconds = String(Math.floor((track.duration_ms / 1000) % 60)).padStart(2, '0');

      // Format the response in a more natural way
      const response =
        `I found "${track.name}" by ${track.artists.join(' and ')}. ` +
        `This song is from the album "${track.album}" and runs for ${minutes}:${seconds}. ` +
        `It was released on ${track.release_date} and has a popularity rating of ${track.popularity} out of 100. `;
      return response;
    },
    {
      name: 'searchTrackDetails',
      description: 'Search for a track and get detailed information without playing it',
      schema: this.searchTrackDetailsSchema,
    },
  );
}
