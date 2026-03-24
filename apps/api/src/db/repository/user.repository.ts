import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/db/repository/base.repository';
import { CouchbaseService } from '@/db/couchbase.service';

@Injectable()
export class UserRepository extends BaseRepository<any> {
  constructor(couchbase: CouchbaseService) {
    super(couchbase, 'users', 'users');
  }
  async findByEmail(email: string) {
    const query = `
    SELECT META().id AS id, u.*
    FROM \`${this.couchbase.getBucket()}\`.\`${this.scope}\`.\`${
      this.collection
    }\` u
    WHERE u.email = $email AND u.deleted = false
    LIMIT 1
  `;

    const result = await this.couchbase.query(query, {
      email,
    } as any);

    return result.rows[0] || null;
  }
}
