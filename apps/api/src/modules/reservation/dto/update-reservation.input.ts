import { CreateReservationInput } from './create-reservation.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateReservationInput extends PartialType(
  CreateReservationInput,
) {
  @Field(() => String)
  id: string;
}
