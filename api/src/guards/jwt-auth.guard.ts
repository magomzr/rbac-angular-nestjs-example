// This guard extends the default AuthGuard provided by @nestjs/passport. It
// checks if the endpoint is public with the @Public() decorator, and, if so, it
// allows access without checking for a JWT.

// If not, it delegates the authentication process to the default JWT strategy
// defined in passport-jwt (the super.canActivate(ctx) call).

import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(ctx);
  }
}
