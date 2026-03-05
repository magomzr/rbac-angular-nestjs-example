import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Activa class-validator en todos los DTOs automáticamente
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors(); // Habilita CORS para que el frontend pueda hacer requests al backend
  await app.listen(3000);
  console.log({ url: await app.getUrl() });
}
bootstrap();
