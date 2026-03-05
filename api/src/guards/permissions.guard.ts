import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from 'src/decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // 1. ¿Qué permisos exige el endpoint a revisar?
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    // Sin decorator -> Ruta pública. Sin análisis
    if (!required?.length) return true;

    // 2. Permisos del usuario (Set, ya esto lo entrega JwtStrategy)
    const { user } = ctx.switchToHttp().getRequest();
    const permSet: Set<string> = user?.permissionSet;

    if (!permSet) throw new UnauthorizedException();

    // 3. ¿Tiene TODOS los permisos requeridos? Esto es O(n), donde
    // n va a ser la cantidad de permisos del decorator, siempre debe
    // ser pequeño.
    const hasAll = required.every((p) => permSet.has(p));
    if (!hasAll) throw new ForbiddenException();

    return true;
  }
}
