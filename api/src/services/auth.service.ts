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

    // Roles del usuario (pueden ser varios)
    const roles = user.roles; // ['admin', 'editor']

    // ✅ Resolver roles → permisos EN EL BACKEND
    // El frontend nunca ve los roles, solo los permisos
    const permissions = this.resolvePermissions(roles);

    const payload = {
      sub: user.id,
      name: user.name,
      permissions, // string[] ya resuelto
    };

    return {
      access_token: this.jwt.sign(payload),
    };
  }

  private resolvePermissions(roles: string[]): string[] {
    // Union de permisos de todos los roles (sin duplicados)
    const merged = new Set<string>();
    for (const role of roles) {
      ROLE_PERMISSIONS[role]?.forEach((p) => merged.add(p));
    }
    return [...merged];
  }
}
