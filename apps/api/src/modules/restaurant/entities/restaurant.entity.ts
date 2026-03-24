import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Restaurant {
  @Field(() => String)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  address: string;

  @Field()
  phone: string;
}
