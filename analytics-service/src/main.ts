import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('API Analytics Service')
    .setDescription('Read model CQRS cho doanh thu, món bán chạy và trạng thái đơn')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`📊 Analytics Service đang chạy ở cổng ${port}`);
}
bootstrap();
