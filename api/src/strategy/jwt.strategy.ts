// Acá es donde vive el Set

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

// JwtPayload la definís vos — refleja lo que firmaste en auth.service.ts
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
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'), // lanza error claro si falta
    });
  }

  // validate() se llama UNA VEZ por cada request,
  // después de verificar al firma del JWT.
  // Lo que retorna se adjunta al request.user
  validate(payload: JwtPayload) {
    return {
      sub: payload.sub,
      name: payload.name,
      // Array -> Set aquí, una sola vez por request
      // Todas las verificaciones del guard son O(1)
      permissionSet: new Set<string>(payload.permissions),
    };
  }
}
