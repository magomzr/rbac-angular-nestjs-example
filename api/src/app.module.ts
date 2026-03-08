// Root module of the app. ConfigModule is registered with isGlobal: true, so we
// can inject ConfigService anywhere without importing the module again. It's
// global, of course.

// The providers array is where we register GLOBAL guards. The order matters
// because they are executed in order, so we want JwtAuthGuard to run before
// PermissionsGuard (first verify JWT, then permissions).

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { ElementsModule } from './modules/elements.module';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './controllers/health.controller';
import { DbModule } from './modules/db.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    AuthModule,
    ElementsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
