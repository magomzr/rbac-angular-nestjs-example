// The users service. this is a very basic implementation, with data coming from
// a database.

// The getPermissions() method is used to get the permissions of a user, and it
// returns an array of strings with those permissions.

// Again, nothing fancy here.

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { Db } from 'src/db';
import { users, permissions, rolePermissions } from 'src/db/schema';
import { Login } from 'src/entities/login';

@Injectable()
export class UsersService {
  constructor(@Inject('DB') private readonly db: Db) {}

  async findById(id: string) {
    return this.db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async findByEmail(email: string) {
    return this.db.query.users.findFirst({ where: eq(users.email, email) });
  }

  async getPermissions(roleId: string): Promise<string[]> {
    const rows = await this.db
      .select({ name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));
    return rows.map((r) => r.name);
  }

  async validateCredentials(dto: Login) {
    const user = await this.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return user;
  }
}
