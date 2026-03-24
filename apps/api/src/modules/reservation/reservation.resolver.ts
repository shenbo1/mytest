import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ReservationService } from '@/modules/reservation/reservation.service';
import { Reservation } from '@/modules/reservation/entities/reservation.entity';
import { CreateReservationInput } from '@/modules/reservation/dto/create-reservation.input';
import { UpdateReservationInput } from '@/modules/reservation/dto/update-reservation.input';
import { ReservationFilterInput } from '@/modules/reservation/dto/filter-reservation.input';
import { ReservationPaginatedResult } from '@/modules/reservation/entities/paginate.entity';

@Resolver(() => Reservation)
export class ReservationResolver {
  constructor(private readonly reservationService: ReservationService) {}

  @Mutation(() => Reservation)
  async createReservation(
    @Args('input')
    createReservationInput: CreateReservationInput,
  ) {
    return await this.reservationService.create(createReservationInput);
  }

  @Query(() => ReservationPaginatedResult, { name: 'reservations' })
  findAll(
    @Args('limit', { type: () => Int }) limit: number,
    @Args('offset', { type: () => Int }) offset: number,
    @Args('filter', { type: () => ReservationFilterInput, nullable: true })
    filter?: ReservationFilterInput,
  ) {
    return this.reservationService.findAll(limit, offset, filter);
  }

  @Query(() => Reservation, { name: 'reservation' })
  async findOne(@Args('id', { type: () => String }) id: string) {
    return await this.reservationService.findOne(id);
  }

  @Mutation(() => Reservation)
  async updateReservation(
    @Args('updateReservationInput')
    updateReservationInput: UpdateReservationInput,
  ) {
    return await this.reservationService.update(
      updateReservationInput.id,
      updateReservationInput,
    );
  }

  @Mutation(() => Reservation)
  async cancel(
    @Args('id', { type: () => String }) id: string,
    @Args('reason', { type: () => String }) reason: string,
  ) {
    return await this.reservationService.cancel(id, reason);
  }

  @Mutation(() => Reservation)
  async complete(@Args('id', { type: () => String }) id: string) {
    return await this.reservationService.complete(id);
  }

  @Mutation(() => Reservation)
  async approve(@Args('id', { type: () => String }) id: string) {
    return await this.reservationService.approve(id);
  }
}
