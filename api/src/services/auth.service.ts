// The service for authentication.

// Here, we have a login() method and a resolvePermissions() method.

// First, the login() receives the login credentials and validates them
// with UsersService (another scope). Then, we extract the user's roles
// and resolve them to permissions (can be more than one).

// The frontend will never see the roles, only the permissions, that's why
// we need to resolve them here and pass them in the JWT payload.

// The resolvePermissions() method takes an array of roles and returns
// an array of permissions, by merging them (without duplicates).

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ROLE_PERMISSIONS } from 'src/config/roles.config';
import { UsersService } from './users.service';
import { Login } from 'src/entities/login';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly users: UsersService,
  ) {}

  async login(dto: Login) {
    const user = await this.users.validateCredentials(dto);
    const roles = user.roles; // ['admin', 'editor']
    const permissions = this.resolvePermissions(roles);
    const payload = {
      sub: user.id,
      name: user.name,
      permissions,
    };

    return {
      access_token: this.jwt.sign(payload),
    };
  }

  private resolvePermissions(roles: string[]): string[] {
    const merged = new Set<string>();
    for (const role of roles) {
      ROLE_PERMISSIONS[role]?.forEach((p) => merged.add(p));
    }
    return [...merged];
  }
}
