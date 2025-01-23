import { Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

const pubSubProvider = {
  provide: 'PUB_SUB',
  useValue: new PubSub(),
};

@Module({
  providers: [pubSubProvider],
  exports: ['PUB_SUB'],
})
export class PubSubModule {}
