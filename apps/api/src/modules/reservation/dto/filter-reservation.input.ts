import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ReservationFilterInput {
  @Field({ nullable: true })
  status?: number;

  @Field({ nullable: true })
  arriveTimeStart?: string;

  @Field({ nullable: true })
  arriveTimeEnd?: string;
}
