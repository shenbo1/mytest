import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/db/repository/base.repository';
import { CouchbaseService } from '@/db/couchbase.service';

@Injectable()
export class ReservationRepository extends BaseRepository<any> {
  constructor(couchbase: CouchbaseService) {
    super(couchbase, 'reservations', 'reservations');
  }
}
