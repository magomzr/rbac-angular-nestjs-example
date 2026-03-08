// The elements service, with data coming from the db.

// Nothing special here, just the usual CRUD operations. The only thing is that
// the `create()` method takes the `userId` as a param, and it comes from the
// JWT token (request.user.sub) in the controller.

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { Db } from 'src/db';
import { elements } from 'src/db/schema';
import { CreateElementDto, UpdateElementDto } from 'src/entities/element';

@Injectable()
export class ElementsService {
  constructor(@Inject('DB') private readonly db: Db) {}

  findAll() {
    return this.db.select().from(elements);
  }

  async findOne(id: string) {
    const row = await this.db.query.elements.findFirst({
      where: eq(elements.id, id),
    });
    if (!row) throw new NotFoundException(`Element ${id} not found`);
    return row;
  }

  async create(dto: CreateElementDto, userId: string) {
    const [row] = await this.db
      .insert(elements)
      .values({
        id: randomUUID(),
        name: dto.name,
        description: dto.description ?? '',
        createdBy: userId,
      })
      .returning();
    return row;
  }

  async update(id: string, dto: UpdateElementDto) {
    await this.findOne(id);
    const [row] = await this.db
      .update(elements)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(elements.id, id))
      .returning();
    return row;
  }

  async publish(id: string) {
    await this.findOne(id);
    const [row] = await this.db
      .update(elements)
      .set({ status: 'published', updatedAt: new Date() })
      .where(eq(elements.id, id))
      .returning();
    return row;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.delete(elements).where(eq(elements.id, id));
    return { deleted: true, id };
  }
}
