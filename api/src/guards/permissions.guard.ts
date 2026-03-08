// This is the main guard for all the permissions checking throughout the app.
// First, it checks if the endpoint has the @RequirePerms() decorator, by
// readiing the metadata with Reflector.  So, the variable "required" returns
// the list of permissions required by the endpoint that  is using this
// decorator.

// If "required" is empty, it means that the endpoint doesn't have this
// decorator. That's okay. It's public then.

// If it's not empty, then it extracts the user's permissions from the request
// (permissionSet). If the user doesn't have permissions, of course this is an
// unauthorized access so we throw it.

// Finally, at this point, the user has both a valid JWT and a permissionSet, so
// we start checking. We check if the user has ALL the permissions required BY
// the endpoint that is being called. This, unfortunately, is O(n), because we
// have to check each required permission, one by one, in the user's
// permissionSet. The point here is that it MUST be a small list of permissions.

// AI suggests between 1 to 5 permissions per endpoint, so it's okay.

// However, the check if the user has a specific permission is O(1) because we
// stored the permissions in a Set in the JwtStrategy. So O(n x 1) = O(n) at the
// end.

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
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!required?.length) return true;

    const { user } = ctx.switchToHttp().getRequest();
    const permSet: Set<string> = user?.permissionSet;

    if (!permSet) throw new UnauthorizedException();

    const hasAll = required.every((p) => permSet.has(p));
    if (!hasAll) throw new ForbiddenException();

    return true;
  }
}
