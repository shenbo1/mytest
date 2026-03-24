import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@/common/filters/http.exception.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { ClsMiddleware } from 'nestjs-cls';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(new ClsMiddleware({}).use);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('api');

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
