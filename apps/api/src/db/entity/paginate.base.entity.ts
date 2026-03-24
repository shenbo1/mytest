import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';

export function PaginatedResult<T>(classRef: Type<T>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResultClass {
    @Field(() => [classRef])
    data: T[];

    @Field(() => Int)
    total: number;

    @Field(() => Int)
    limit: number;

    @Field(() => Int)
    offset: number;

    @Field()
    hasMore: boolean;
  }

  return PaginatedResultClass;
}
