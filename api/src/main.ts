// This is where the app starts. The reason we have a new ValidationPipe here is
// to activate class-validator in all our DTOs automatically. The whitelist
// property is to strip out any properties that are not defined in DTOs, for
// security.

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();
  await app.listen(3000);
  console.log({ url: await app.getUrl() });
}
bootstrap();
