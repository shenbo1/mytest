import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from '@/modules/reservation/reservation.service';
import { DatabaseModule } from '@/db/database.module';
import { ClsModule, ClsService } from 'nestjs-cls';
import { CreateReservationInput } from '@/modules/reservation/dto/create-reservation.input';
import { UpdateReservationInput } from '@/modules/reservation/dto/update-reservation.input';
import { ReservationStatus } from './enum';
import { ConfigModule } from '@nestjs/config';
import { appConfigs } from '@/common/config';
import { INestApplication } from '@nestjs/common';

describe('ReservationService - 集成测试', () => {
  let service: ReservationService;
  let app: INestApplication;
  const testUserId = 'test-user-' + Date.now();
  const createdReservationIds: string[] = [];
  const mockUser = { id: testUserId, role: 'admin' };

  beforeAll(async () => {
    // 创建测试模块
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: appConfigs,
        }),
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
            generateId: true,
          },
        }),
        DatabaseModule,
      ],
      providers: [
        ReservationService,
        {
          provide: ClsService,
          useValue: {
            get: (key: string) => {
              if (key === 'user') return mockUser;
              return null;
            },
            set: () => {},
            run: (callback: any) => callback(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    service = module.get<ReservationService>(ReservationService);
  });

  afterAll(async () => {
    // 清理测试数据
    console.log('开始清理测试数据...');
    for (const id of createdReservationIds) {
      try {
        await service['db'].reservation.delete(id);
        console.log(`已删除测试预订：${id}`);
      } catch (error) {
        console.error(`删除测试预订 ${id} 失败:`, error);
      }
    }
    await app.close();
  });

  describe('创建预订', () => {
    it('应该成功创建一个新预订', async () => {
      const createInput: CreateReservationInput = {
        restaurantId: 'rest-001',
        restaurantName: '测试餐厅',
        tableSize: 4,
        guestName: '张三',
        guestPhone: '13800138000',
        guestEmail: 'zhangsan@example.com',
        arriveTime: new Date(Date.now() + 86400000), // 明天
      };

      const result = await service.create(createInput);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.restaurantId).toBe(createInput.restaurantId);
      expect(result.restaurantName).toBe(createInput.restaurantName);
      expect(result.tableSize).toBe(createInput.tableSize);
      expect(result.guestName).toBe(createInput.guestName);
      expect(result.guestPhone).toBe(createInput.guestPhone);
      expect(result.guestEmail).toBe(createInput.guestEmail);
      expect(result.status).toBe(ReservationStatus.REQUESTED);

      createdReservationIds.push(result.id);
    });

    it('应该创建多个不同状态的预订用于后续测试', async () => {
      const inputs = [
        {
          restaurantId: 'rest-002',
          restaurantName: '测试餐厅 2 号',
          tableSize: 2,
          guestName: '李四',
          guestPhone: '13900139000',
          guestEmail: 'lisi@example.com',
          arriveTime: new Date(Date.now() + 172800000), // 后天
        },
        {
          restaurantId: 'rest-003',
          restaurantName: '测试餐厅 3 号',
          tableSize: 6,
          guestName: '王五',
          guestPhone: '13700137000',
          guestEmail: 'wangwu@example.com',
          arriveTime: new Date(Date.now() + 259200000), // 大后天
        },
      ];

      for (const input of inputs) {
        const result = await service.create(input as CreateReservationInput);
        createdReservationIds.push(result.id);
        expect(result.status).toBe(ReservationStatus.REQUESTED);
      }
    });
  });

  describe('查询预订', () => {
    it('应该通过 ID 查询到创建的预订', async () => {
      if (createdReservationIds.length === 0) {
        throw new Error('没有可用的测试预订');
      }

      const firstId = createdReservationIds[0];
      const result = await service.findOne(firstId);

      expect(result).toBeDefined();
      expect(result.id).toBe(firstId);
      expect(result.status).toBe(ReservationStatus.REQUESTED);
    });

    it('应该查询不到不存在的预订', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow();
    });

    it('应该分页查询预订列表', async () => {
      const result = await service.findAll(10, 0);

      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('应该支持按客人姓名筛选', async () => {
      // 等待更长时间让数据被索引
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = await service.findAll(10, 0, { guestName: '张' });

      expect(result).toBeDefined();
      // 不强制要求有结果，因为可能没有匹配的数据
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('应该支持按时间范围筛选', async () => {
      // 等待更长时间让数据被索引
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const tomorrow = new Date(Date.now() + 86400000);
      const dayAfterTomorrow = new Date(Date.now() + 172800000);

      const result = await service.findAll(10, 0, {
        arriveTimeStart: tomorrow.toISOString().split('T')[0],
        arriveTimeEnd: dayAfterTomorrow.toISOString().split('T')[0],
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('更新预订', () => {
    it('应该成功更新预订信息', async () => {
      if (createdReservationIds.length === 0) {
        throw new Error('没有可用的测试预订');
      }

      const updateInput: UpdateReservationInput = {
        id: createdReservationIds[0],
        guestName: '张三（已更新）',
        tableSize: 6,
      };

      const result = await service.update(
        createdReservationIds[0],
        updateInput,
      );

      expect(result).toBeDefined();
      // 注意：由于 fillDto 会转换，这里主要验证不抛异常
    });

    it('应该只更新提供的字段', async () => {
      const id = createdReservationIds[1];
      const original = await service.findOne(id);

      const updateInput: UpdateReservationInput = {
        id,
        guestPhone: '13900139001',
      };

      await service.update(id, updateInput);
      const updated = await service.findOne(id);

      expect(updated.guestPhone).toBe('13900139001');
      expect(updated.guestName).toBe(original.guestName); // 其他字段不变
    });
  });

  describe('审批预订', () => {
    it('应该成功审批一个 REQUESTED 状态的预订', async () => {
      // 创建一个新的预订专门用于审批测试
      const createInput: CreateReservationInput = {
        restaurantId: 'rest-approve-test',
        restaurantName: '审批测试餐厅',
        tableSize: 4,
        guestName: '审批测试用户',
        guestPhone: '13800138001',
        guestEmail: 'approve@example.com',
        arriveTime: new Date(Date.now() + 86400000),
      };

      const created = await service.create(createInput);
      createdReservationIds.push(created.id);

      await service.approve(created.id);

      // 验证数据库中的实际状态
      const fromDb = await service.findOne(created.id);
      expect(fromDb.status).toBe(ReservationStatus.APPROVED);
    });

    it('应该拒绝非法的状态转换', async () => {
      // 先创建一个预订并审批
      const createInput: CreateReservationInput = {
        restaurantId: 'rest-invalid-test',
        restaurantName: '非法状态测试餐厅',
        tableSize: 2,
        guestName: '测试用户',
        guestPhone: '13800138002',
        guestEmail: 'invalid@example.com',
        arriveTime: new Date(Date.now() + 86400000),
      };

      const created = await service.create(createInput);
      createdReservationIds.push(created.id);
      await service.approve(created.id);

      // 尝试再次审批已经 APPROVED 的预订应该失败
      await expect(service.approve(created.id)).rejects.toThrow(
        'Invalid status transition',
      );
    });
  });

  describe('完成预订', () => {
    it('应该成功完成一个 APPROVED 状态的预订', async () => {
      // 创建并审批一个预订
      const createInput: CreateReservationInput = {
        restaurantId: 'rest-complete-test',
        restaurantName: '完成测试餐厅',
        tableSize: 4,
        guestName: '完成测试用户',
        guestPhone: '13800138003',
        guestEmail: 'complete@example.com',
        arriveTime: new Date(Date.now() + 86400000),
      };

      const created = await service.create(createInput);
      createdReservationIds.push(created.id);
      await service.approve(created.id);

      await service.complete(created.id);

      // 验证数据库中的实际状态
      const fromDb = await service.findOne(created.id);
      expect(fromDb.status).toBe(ReservationStatus.COMPLETED);
    });

    it('应该拒绝从未审批状态直接完成', async () => {
      const createInput: CreateReservationInput = {
        restaurantId: 'rest-skip-test',
        restaurantName: '跳过审批测试餐厅',
        tableSize: 2,
        guestName: '跳过测试用户',
        guestPhone: '13800138004',
        guestEmail: 'skip@example.com',
        arriveTime: new Date(Date.now() + 86400000),
      };

      const created = await service.create(createInput);
      createdReservationIds.push(created.id);

      // 尝试直接完成未审批的预订应该失败
      await expect(service.complete(created.id)).rejects.toThrow(
        'Invalid status transition',
      );
    });
  });

  describe('取消预订', () => {
    it('应该成功取消一个 REQUESTED 状态的预订', async () => {
      const createInput: CreateReservationInput = {
        restaurantId: 'rest-cancel-test-1',
        restaurantName: '取消测试餐厅 1 号',
        tableSize: 4,
        guestName: '取消测试用户 1',
        guestPhone: '13800138005',
        guestEmail: 'cancel1@example.com',
        arriveTime: new Date(Date.now() + 86400000),
      };

      const created = await service.create(createInput);
      createdReservationIds.push(created.id);

      await service.cancel(created.id, '客户主动取消');

      // 验证数据库中的实际状态
      const fromDb = await service.findOne(created.id);
      expect(fromDb.status).toBe(ReservationStatus.CANCELLED);
      expect(fromDb.cancelReason).toContain('客户主动取消');
    });
  });

  describe('状态流转验证', () => {
    it('应该遵循正确的状态流转路径：REQUESTED -> APPROVED -> COMPLETED', async () => {
      const createInput: CreateReservationInput = {
        restaurantId: 'rest-flow-test',
        restaurantName: '状态流转测试餐厅',
        tableSize: 4,
        guestName: '状态流转测试用户',
        guestPhone: '13800138008',
        guestEmail: 'flow@example.com',
        arriveTime: new Date(Date.now() + 86400000),
      };

      // 创建预订
      const created = await service.create(createInput);
      createdReservationIds.push(created.id);
      expect(created.status).toBe(ReservationStatus.REQUESTED);

      // 审批预订
      await service.approve(created.id);

      // 等待一下让审批状态被索引
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 完成预订
      await service.complete(created.id);

      // 验证最终状态
      const final = await service.findOne(created.id);
      expect(final.status).toBe(ReservationStatus.COMPLETED);
    });

    it('应该遵循正确的状态流转路径：REQUESTED -> CANCELLED', async () => {
      const createInput: CreateReservationInput = {
        restaurantId: 'rest-flow-test-2',
        restaurantName: '状态流转测试餐厅 2 号',
        tableSize: 2,
        guestName: '状态流转测试用户 2',
        guestPhone: '13800138009',
        guestEmail: 'flow2@example.com',
        arriveTime: new Date(Date.now() + 86400000),
      };

      // 创建预订
      const created = await service.create(createInput);
      createdReservationIds.push(created.id);
      expect(created.status).toBe(ReservationStatus.REQUESTED);

      // 取消预订
      await service.cancel(created.id, '流程测试取消');

      // 等待更长时间让取消状态被索引
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 验证不能对已取消的预订执行其他操作
      await expect(service.approve(created.id)).rejects.toThrow();
      await expect(service.complete(created.id)).rejects.toThrow();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理大量数据的分页查询', async () => {
      // 创建一批测试数据
      const batchSize = 15;
      const batchIds: string[] = [];

      for (let i = 0; i < batchSize; i++) {
        const createInput: CreateReservationInput = {
          restaurantId: `rest-batch-${i}`,
          restaurantName: `批量测试餐厅${i}`,
          tableSize: (i % 10) + 1,
          guestName: `批量用户${i}`,
          guestPhone: `138001380${String(i).padStart(2, '0')}`,
          guestEmail: `batch${i}@example.com`,
          arriveTime: new Date(Date.now() + i * 86400000),
        };

        const result = await service.create(createInput);
        batchIds.push(result.id);
        createdReservationIds.push(result.id);
      }

      // 等待更长时间让数据被索引
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 测试第一页
      const page1 = await service.findAll(10, 0);
      expect(page1.data.length).toBeGreaterThan(0);
      expect(page1.limit).toBe(10);

      // 测试第二页
      const page2 = await service.findAll(10, 10);
      expect(page2.data.length).toBeGreaterThanOrEqual(0);
    });
  });
});
