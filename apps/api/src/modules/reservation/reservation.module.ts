import { Module } from '@nestjs/common';
import { ReservationService } from '@/modules/reservation/reservation.service';
import { ReservationResolver } from '@/modules/reservation/reservation.resolver';
import { DatabaseModule } from '@/db/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ReservationResolver, ReservationService],
})
export class ReservationModule {}
