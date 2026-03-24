import { Injectable } from '@nestjs/common';
import { CreateReservationInput } from '@/modules/reservation/dto/create-reservation.input';
import { UpdateReservationInput } from '@/modules/reservation/dto/update-reservation.input';
import { DatabaseService } from '@/db/database.service';
import { ReservationPaginatedResult } from '@/modules/reservation/entities/paginate.entity';
import { ReservationStatus } from '@/modules/reservation/enum';
import { Reservation } from '@/modules/reservation/entities/reservation.entity';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class ReservationService {
  constructor(
    private readonly db: DatabaseService,
    private readonly cls: ClsService,
  ) {}
  async create(createReservationInput: CreateReservationInput) {
    const result = await this.db.reservation.create({
      ...createReservationInput,
      userId: this.cls.get('user').id,
      status: ReservationStatus.REQUESTED,
    });
    return result;
  }

  async findAll(
    limit = 10,
    offset = 0,
    filter?: any,
  ): Promise<ReservationPaginatedResult> {
    const user = this.cls.get('user');

    let whereClause = '';
    const conditions: string[] = [];

    if (filter) {
      if (filter.status !== undefined && filter.status !== null) {
        conditions.push(`status = ${filter.status}`);
      }

      if (filter.arriveTimeStart) {
        conditions.push(
          `arriveTime >= "${filter.arriveTimeStart}T00:00:00.000Z"`,
        );
      }

      if (filter.arriveTimeEnd) {
        conditions.push(
          `arriveTime <= "${filter.arriveTimeEnd}T23:59:59.999Z"`,
        );
      }
    }

    if (user.role === 'user') {
      conditions.push(`userId = "${user.id}"`);
    }

    if (conditions.length > 0) {
      whereClause = conditions.join(' AND ');
    }

    const result = await this.db.reservation.paginate({
      limit,
      offset,
      where: whereClause,
    });

    return {
      data: result.data.map((item) => this.fillDto(item)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      hasMore: result.hasMore,
    };
  }

  async findOne(id: string) {
    const entity = await this.db.reservation.findById(id);
    if (!entity) {
      throw new Error('Reservation not found');
    }
    return this.fillDto(entity);
  }

  async update(id: string, updateReservationInput: UpdateReservationInput) {
    const reservation = await this.findOne(id);
    const updates = Object.keys(updateReservationInput).reduce((acc, key) => {
      const value = updateReservationInput[key];
      if (value != null) {
        acc[key] = value;
      }
      return acc;
    }, {});

    await this.db.reservation.update(id, { ...reservation, ...updates });
    return reservation;
  }

  async approve(id: string) {
    const reservation = await this.findOne(id);
    this.checkStatus(reservation.status, ReservationStatus.APPROVED);
    await this.db.reservation.update(id, {
      ...reservation,
      approveAt: new Date(),
      approveId: this.cls.get('user').id,
      status: ReservationStatus.APPROVED,
    });
    return reservation;
  }

  async cancel(id: string, reason: string) {
    const reservation = await this.findOne(id);
    this.checkStatus(reservation.status, ReservationStatus.CANCELLED);
    await this.db.reservation.update(id, {
      ...reservation,
      cancelAt: new Date(),
      cancelId: this.cls.get('user').id,
      status: ReservationStatus.CANCELLED,
      cancelReason: `cancel by ${this.cls.get('user').role} , ${reason}`,
    });
    return reservation;
  }

  async complete(id: string) {
    const reservation = await this.findOne(id);
    this.checkStatus(reservation.status, ReservationStatus.COMPLETED);
    await this.db.reservation.update(id, {
      ...reservation,
      completedAt: new Date(),
      completedId: this.cls.get('user').id,
      status: ReservationStatus.COMPLETED,
    });
    return reservation;
  }

  fillDto(data: Reservation) {
    return {
      ...data,
      arriveTime: new Date(data.arriveTime),
      operate: this.getStatus()[data.status],
    };
  }

  checkStatus(from: ReservationStatus, to: ReservationStatus) {
    const status = this.getStatus();
    if (!status[from]?.includes(to)) {
      throw new Error('Invalid status transition');
    }
  }
  getStatus() {
    return {
      [ReservationStatus.REQUESTED]: [
        ReservationStatus.APPROVED,
        ReservationStatus.CANCELLED,
      ],
      [ReservationStatus.APPROVED]: [ReservationStatus.COMPLETED],
      [ReservationStatus.CANCELLED]: [],
      [ReservationStatus.COMPLETED]: [],
    };
  }
}
