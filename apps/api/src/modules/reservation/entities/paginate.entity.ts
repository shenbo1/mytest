import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Reservation } from '@/modules/reservation/entities/reservation.entity';

@ObjectType()
export class ReservationPaginatedResult {
  @Field(() => [Reservation])
  data: Reservation[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  offset: number;

  @Field()
  hasMore: boolean;
}
