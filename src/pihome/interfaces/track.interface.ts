export interface Track {
  _id: string;
  uri: string;
  name: string;
  artists: string[];
  albumName: string;
  createdAt: Date;
  updatedAt: Date;
}
