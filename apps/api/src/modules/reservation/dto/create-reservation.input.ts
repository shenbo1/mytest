import { InputType, Int, Field, GraphQLISODateTime } from '@nestjs/graphql';
import { IsEmail, Length, Matches, Max, Min } from 'class-validator';

@InputType()
export class CreateReservationInput {
  @Field(() => String, { description: 'Restaurant id must be valid' })
  restaurantId: string;

  @Field(() => String, { description: 'Restaurant name must be valid' })
  restaurantName: string;

  @Field(() => Int, { description: 'Table size must be valid' })
  @Min(1)
  @Max(20)
  tableSize: number;

  @Field(() => String, { description: 'Guest name must be valid' })
  @Length(1, 30)
  guestName: string;

  @Field(() => String, {
    description: 'Guest phone must be valid',
  })
  @Matches(/^1[0-9]{10}$/, {
    message: 'unvalid phone number format',
  })
  guestPhone: string;

  @Field(() => String, { description: 'Guest email muse be valid' })
  @IsEmail()
  guestEmail: string;

  @Field(() => GraphQLISODateTime, {
    description: 'Arrival time must be valid',
  })
  arriveTime: Date;
}
