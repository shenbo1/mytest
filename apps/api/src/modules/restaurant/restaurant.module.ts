import { Module } from '@nestjs/common';
import { RestaurantService } from '@/modules/restaurant/restaurant.service';
import { RestaurantResolver } from '@/modules/restaurant/restaurant.resolver';
import { DatabaseModule } from '@/db/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [RestaurantResolver, RestaurantService],
})
export class RestaurantModule {}
