// The service for authentication.

// Here, we have a login() method and a getPermissions() call.

// First, the login() receives the login credentials and validates them with
// UsersService (another scope). Then, we extract the user's roles and resolve
// them to permissions (can be more than one).

// The frontend will never see the roles, only the permissions, that's why we
// need to resolve them here and pass them in the JWT payload.

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
    const permissions = await this.users.getPermissions(user.roleId);
    return {
      access_token: this.jwt.sign(
        { sub: user.id, name: user.name, permissions },
        { expiresIn: '15m' },
      ),
      refresh_token: this.jwt.sign({ sub: user.id }, { expiresIn: '7d' }),
    };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.jwt.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    const permissions = await this.users.getPermissions(user.roleId);
    return {
      access_token: this.jwt.sign(
        { sub: user.id, name: user.name, permissions },
        { expiresIn: '15m' },
      ),
    };
  }
}
