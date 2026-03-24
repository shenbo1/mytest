import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as couchbase from 'couchbase';
import { ClsService } from 'nestjs-cls';
import { databaseConfig } from '@/common/config';

@Injectable()
export class CouchbaseService implements OnModuleInit {
  private cluster;
  private bucket;

  constructor(
    @Inject(databaseConfig.KEY)
    private readonly config: ConfigType<typeof databaseConfig>,
    private readonly cls: ClsService,
  ) {}

  async onModuleInit() {
    try {
      this.cluster = await couchbase.connect(this.config.connectionString, {
        username: this.config.username,
        password: this.config.password,
      });

      this.bucket = this.cluster.bucket(this.config.bucket);
    } catch (error) {
      throw error;
    }
  }

  getBucket() {
    return this.config.bucket;
  }

  getCollection(scope: string, collection: string) {
    return this.bucket.scope(scope).collection(collection);
  }

  async create(id: string, scope: string, collection: string, data: any) {
    return await this.getCollection(scope, collection).upsert(id, {
      ...data,
      deleted: false,
      createdAt: Date.now(),
      createdBy: this.cls.get('user')?.id ?? 'system',
    });
  }

  async query(query: string, params?: any[]) {
    return await this.cluster.query(query, { parameters: params });
  }

  async findById(scope: string, collection: string, id: string) {
    const res = await this.getCollection(scope, collection).get(id);
    return res.content;
  }

  async update(scope: string, collection: string, id: string, data: any) {
    return this.getCollection(scope, collection).upsert(id, {
      ...data,
      updatedAt: Date.now(),
      updatedBy: this.cls.get('user')?.id ?? 'system',
    });
  }

  async delete(scope: string, collection: string, id: string) {
    return this.getCollection(scope, collection).upsert(id, {
      deleted: true,
      deletedAt: Date.now(),
      deletedBy: this.cls.get('user')?.id ?? 'system',
    });
  }
}
