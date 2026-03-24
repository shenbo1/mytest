import { Module } from '@nestjs/common';
import { CouchbaseService } from '@/db/couchbase.service';
import { UserRepository } from '@/db/repository/user.repository';
import { ReservationRepository } from '@/db/repository/reservation.repository';
import { DatabaseService } from '@/db/database.service';
import { RestaurantRepository } from '@/db/repository/restaurant.repository';

@Module({
  imports: [],
  providers: [
    CouchbaseService,
    UserRepository,
    ReservationRepository,
    RestaurantRepository,
    DatabaseService,
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
