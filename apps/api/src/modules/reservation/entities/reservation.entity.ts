import { ObjectType, Field, Int } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class Reservation {
  @Field(() => String)
  id: string;

  @Field(() => String)
  restaurantId: string;

  @Field(() => String)
  restaurantName: string;

  @Field(() => Int)
  tableSize: number;

  @Field(() => GraphQLISODateTime)
  arriveTime: Date;

  @Field(() => String)
  guestName: string;

  @Field(() => String)
  guestPhone: string;

  @Field(() => String)
  guestEmail: string;

  @Field(() => Int)
  status: number;

  @Field(() => [Int])
  operate: number[];

  @Field(() => String, { nullable: true })
  cancelReason?: string;
}
