import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ReservationModule } from '@/modules/reservation/reservation.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/db/database.module';
import { appConfigs } from '@/common/config';
import { AuthModule } from '@/modules/auth/auth.module';
import { ClsModule } from 'nestjs-cls';
import { RestaurantModule } from '@/modules/restaurant/restaurant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: appConfigs,
    }),
    // 先初始化 CLS 模块，确保上下文可用
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req) => {
          const requestId = req.headers['x-request-id'] as string;
          return requestId || new Date().getTime().toString();
        },
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      context: ({ req }) => {
        return { req };
      },
      // formatError: (error) => {
      //   return {
      //     message: error.extensions.originalError['message'],
      //     code: error.extensions?.code,
      //     path: error.path,
      //   };
      // },
    }),
    ReservationModule,
    DatabaseModule,
    AuthModule,
    RestaurantModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
