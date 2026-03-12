// Root module of the app. ConfigModule is registered with isGlobal: true, so we
// can inject ConfigService anywhere without importing the module again. It's
// global, of course.

// The providers array is where we register GLOBAL guards. The order matters
// because they are executed in order, so we want JwtAuthGuard to run before
// PermissionsGuard (first verify JWT, then permissions).

import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './modules/auth.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { ElementsModule } from './modules/elements.module';
import { HealthController } from './controllers/health.controller';
import { DbModule } from './modules/db.module';
import { TraceMiddleware, traceStore } from './middlewares/trace.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          mixin: () => {
            const store = traceStore.getStore();
            return store ? { traceId: store.traceId } : {};
          },
          customProps: () => ({ app: 'rbac-api' }),
          serializers: {
            req: (req) => ({
              method: req.method,
              url: req.url,
              userId: req.raw?.user?.sub ?? 'anonymous',
            }),
            res: (res) => ({ statusCode: res.statusCode }),
          },
          transport: {
            targets: [
              {
                target: 'pino-loki',
                level: 'info',
                options: {
                  host: config.get('LOKI_HOST'),
                  batching: true,
                  interval: 5,
                  silenceErrors: true,
                  labels: { app: 'rbac-api' },
                },
              },
            ],
          },
        },
      }),
    }),
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).forRoutes('*');
  }
}
