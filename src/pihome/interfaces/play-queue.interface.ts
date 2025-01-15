import { Track } from './track.interface';

export interface PlayQueue {
  _id: string;
  deviceGroupId: string;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
}
