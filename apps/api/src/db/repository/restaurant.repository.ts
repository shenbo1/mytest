import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/db/repository/base.repository';
import { CouchbaseService } from '@/db/couchbase.service';

@Injectable()
export class RestaurantRepository extends BaseRepository<any> {
  constructor(couchbase: CouchbaseService) {
    super(couchbase, 'restaurants', 'restaurants');
  }

  async findAll(): Promise<any[]> {
    const result = await this.couchbase.query(
      `SELECT t.*, META().id AS id FROM \`${this.couchbase.getBucket()}\`.\`${
        this.scope
      }\`.\`${this.collection}\` as t WHERE t.deleted = false`,
      [],
    );
    return result.rows;
  }
}
