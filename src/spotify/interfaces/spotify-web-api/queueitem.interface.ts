interface QueueItem {
  name: string;
  artists: string[];
}

interface QueueResponse {
  currentlyPlaying: QueueItem | null;
  queue: QueueItem[];
}
