import { ulid } from 'ulid';
import { CouchbaseService } from '@/db/couchbase.service';

export class BaseRepository<T> {
  constructor(
    protected couchbase: CouchbaseService,
    protected scope: string,
    protected collection: string,
  ) {}

  async create(data: Partial<T>) {
    try {
      const id = ulid();
      const result = await this.couchbase.create(
        id,
        this.scope,
        this.collection,
        data,
      );
      return {
        success: true,
        ...data,
        id,
        cas: result.cas.toString(),
      };
    } catch (e) {
      throw e;
    }
  }

  async findById(id: string): Promise<T> {
    const result = await this.couchbase.findById(
      this.scope,
      this.collection,
      id,
    );
    if (!result || result.deleted) {
      return null;
    }
    return { ...result, id } as T;
  }

  async update(id: string, data: Partial<T>) {
    return this.couchbase.update(this.scope, this.collection, id, data);
  }

  async delete(id: string) {
    return this.couchbase.delete(this.scope, this.collection, id);
  }

  async paginate({
    limit = 10,
    offset = 0,
    where,
  }: {
    limit?: number;
    offset?: number;
    where?: string;
  }) {
    const defaultWhere = 'WHERE deleted = false';

    const finalWhere = where
      ? `${defaultWhere} ${where.startsWith('AND') ? where : `AND ${where}`}`
      : defaultWhere;

    const dataQuery = `
    SELECT t.*,META().id AS id FROM \`${this.couchbase.getBucket()}\`.\`${
      this.scope
    }\`.\`${this.collection}\` as t
    ${finalWhere}
    ORDER BY t.createdAt DESC
    LIMIT $1 OFFSET $2
  `;

    const countQuery = `
    SELECT COUNT(*) AS total
    FROM \`${this.couchbase.getBucket()}\`.\`${this.scope}\`.\`${
      this.collection
    }\`
    ${finalWhere}
  `;

    const [dataRes, countRes] = await Promise.all([
      this.couchbase.query(dataQuery, [limit, offset]),
      this.couchbase.query(countQuery),
    ]);

    return {
      data: dataRes.rows,
      total: countRes.rows[0].total,
      limit,
      offset,
      hasMore: offset + limit < countRes.rows[0].total,
    };
  }
}
