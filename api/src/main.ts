// This is where the app starts. The reason we have a new ValidationPipe here is
// to activate class-validator in all our DTOs automatically. The whitelist
// property is to strip out any properties that are not defined in DTOs, for
// security.

// With bufferLogs: true, NestJS buffers the logs during the bootstrap phase until
// pino is ready, so we don't lose any log messages

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());
  app.enableCors({ origin: 'http://localhost:8080', credentials: true });
  await app.listen(3000);
  app.get(Logger).log(`Application running on ${await app.getUrl()}`);
}
bootstrap();
