import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Db, MongoClient } from 'mongodb';

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private readonly logger = new Logger('MongoService');

  constructor(private readonly configService: ConfigService) {
    this.client = new MongoClient(this.configService.get('MONGO_URL'));
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('MongoDB connected successfully');
    } catch (error) {
      this.logger.error('MongoDB connection error:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.close();
      this.logger.log('MongoDB connection closed');
    } catch (error) {
      this.logger.error('MongoDB connection close error:', error);
    }
  }

  getClient(): MongoClient {
    return this.client;
  }

  getDb(): Db {
    return this.client.db();
  }
}
