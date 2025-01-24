import { Provider } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { EventEmitter } from 'events';

export const PUB_SUB = 'PUB_SUB';
const pubsub = new PubSub();
(pubsub as any).ee.setMaxListeners(100);

export const PubSubProvider: Provider = {
  provide: PUB_SUB,
  useValue: pubsub,
};
