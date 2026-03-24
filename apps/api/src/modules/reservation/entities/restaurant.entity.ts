import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Restaurant {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  location: string;
}
