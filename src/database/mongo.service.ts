import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Db, MongoClient } from 'mongodb';

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new MongoClient(this.configService.get('MONGO_URL'));
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('MongoDB connection close error:', error);
    }
  }

  getClient(): MongoClient {
    return this.client;
  }

  getDb(): Db {
    return this.client.db();
  }
}
