// The elements service. Of course, this is an in-memory implementation,
// so if it's necessary to get data from a db, this is the place to get it.

// Nothing special here, just the usual CRUD operations. The only thing is
// that the `create()` method takes the `userId` as a param, and it comes
// from the JWT token (request.user.sub) in the controller.

import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  Element,
  CreateElementDto,
  UpdateElementDto,
} from 'src/entities/element';

@Injectable()
export class ElementsService {
  private readonly elements: Element[] = [
    {
      id: '1',
      name: 'Element Alpha',
      description: 'First test element',
      createdBy: '1',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Element Beta',
      description: 'Second test element',
      createdBy: '2',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  findAll(): Element[] {
    return this.elements;
  }

  findOne(id: string): Element {
    const element = this.elements.find((e) => e.id === id);
    if (!element) throw new NotFoundException(`Element ${id} not found`);
    return element;
  }

  create(dto: CreateElementDto, userId: string): Element {
    const element: Element = {
      id: randomUUID(),
      name: dto.name,
      description: dto.description ?? '',
      createdBy: userId,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.elements.push(element);
    return element;
  }

  update(id: string, dto: UpdateElementDto): Element {
    const element = this.findOne(id);
    if (dto.name) element.name = dto.name;
    if (dto.description) element.description = dto.description;
    element.updatedAt = new Date();
    return element;
  }

  publish(id: string): Element {
    const element = this.findOne(id);
    element.status = 'published';
    element.updatedAt = new Date();
    return element;
  }

  remove(id: string): { deleted: boolean; id: string } {
    const index = this.elements.findIndex((e) => e.id === id);
    if (index === -1) throw new NotFoundException(`Element ${id} not found`);
    this.elements.splice(index, 1);
    return { deleted: true, id };
  }
}
