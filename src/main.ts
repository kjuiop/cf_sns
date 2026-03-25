import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Transform } from 'class-transformer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    // 값을 넣어주는 default 값을 변환하는 작업을 허용한다.
    transform: true,
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
