// This is where the Set lives.

// This file defines the JwtStrategy, responsible for validating JWTs in
// incoming requests. The strategy is registered in the AuthModule and it is
// automatically activated when JwtAuthGuard invokes it (with `export class
// JwtAuthGuard extends AuthGuard('jwt')` in jwt-auth.guard.ts). So, the
// conection is through Passport.

// The JwtPayload is defined by us, so it reflects what we sign in
// auth.service.ts (with `this.jwt.sign(payload)`).

// Of course, we need the JWT_SECRET and that's why the JwtModule is registered
// with registerAsync() in AuthModule, to get the secret from ConfigService
// (async call).

// The `validate()` method is executed once PER request, after verifying the JWT
// signature. What it returns is attached to request.user, to make it available
// in controllers and guards.

// The .permissionSet is the property we use in guards/permissions.guard.ts.
// This is the part where we have an 0(1) check for permissions later in the
// guard.

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  name: string;
  permissions: string[];
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return {
      sub: payload.sub,
      name: payload.name,
      permissionSet: new Set<string>(payload.permissions),
    };
  }
}
