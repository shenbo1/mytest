import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/db/repository/user.repository';
import { ReservationRepository } from '@/db/repository/reservation.repository';
import { RestaurantRepository } from '@/db/repository/restaurant.repository';

@Injectable()
export class DatabaseService {
  constructor(
    public user: UserRepository,
    public reservation: ReservationRepository,
    public restaurant: RestaurantRepository,
  ) {}
}
