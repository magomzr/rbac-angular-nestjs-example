// The users service.

// this is a very simple in-memory implementation, but in a real app
// this would come from a database, like a TypeORM or Prisma repo.

// Again, nothing fancy here.

import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Login } from 'src/entities/login';
import { User } from 'src/entities/user';

@Injectable()
export class UsersService {
  // En producción esto sería tu repositorio de TypeORM/Prisma
  private readonly users: User[] = [
    {
      id: '1',
      name: 'Bob',
      email: 'bob@test.com',
      password: bcrypt.hashSync('secret123', 10),
      roles: ['admin'],
    },
    {
      id: '2',
      name: 'Charlie',
      email: 'charlie@test.com',
      password: bcrypt.hashSync('secret123', 10),
      roles: ['editor'],
    },
    {
      id: '3',
      name: 'Dana',
      email: 'dana@test.com',
      password: bcrypt.hashSync('secret123', 10),
      roles: ['viewer'],
    },
  ];

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  async validateCredentials(dto: Login): Promise<User> {
    const user = this.findByEmail(dto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return user;
  }
}
