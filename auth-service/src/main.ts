import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('API Auth Service')
    .setDescription('Đăng nhập, JWT và tài khoản nhân sự')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🔐 Auth Service đang chạy ở cổng ${port}`);
}
bootstrap();
