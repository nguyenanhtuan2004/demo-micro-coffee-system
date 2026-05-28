import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('API Inventory Service')
    .setDescription('Tồn kho, cảnh báo tồn thấp và nhập kho')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`🏪 Inventory Service đang chạy ở cổng ${port}`);
}
bootstrap();
