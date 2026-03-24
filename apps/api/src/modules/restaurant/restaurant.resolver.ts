import { Resolver, Query } from '@nestjs/graphql';
import { RestaurantService } from '@/modules/restaurant/restaurant.service';
import { Restaurant } from '@/modules/restaurant/entities/restaurant.entity';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Query(() => [Restaurant], { name: 'restaurants' })
  findAll() {
    return this.restaurantService.findAll();
  }
}
