import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/db/database.service';
import { Restaurant } from '@/modules/restaurant/entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(private readonly db: DatabaseService) {}

  findAll(): Promise<Restaurant[]> {
    return this.db.restaurant.findAll();
  }
}
