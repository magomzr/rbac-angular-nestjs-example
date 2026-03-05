// Now, this controller does use guards. First, the JwtAuthGuard, which checks valid JWT tokens.
// Then, the PermissionsGuard, for permission checks. The UseGuards at the class level ensures
// that every endpoint in THIS controller will be protected BY BOTH guards.

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ElementsService } from '../services/elements.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { Perm } from 'src/config/roles.config';
import { RequirePerms } from 'src/decorators/permissions.decorator';
import { CreateElementDto, UpdateElementDto } from 'src/entities/element';

@Controller('elements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ElementsController {
  constructor(private readonly service: ElementsService) {}

  @Get()
  @RequirePerms(Perm.READ)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @RequirePerms(Perm.READ)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePerms(Perm.INSERT)
  create(@Body() dto: CreateElementDto, @Request() req: any) {
    // `req.user.sub` represents the userId, so that we can associate
    // the created element with the user that created it.
    return this.service.create(dto, req.user.sub);
  }

  @Patch(':id')
  @RequirePerms(Perm.UPDATE)
  update(@Param('id') id: string, @Body() dto: UpdateElementDto) {
    return this.service.update(id, dto);
  }

  // In this case, we want to allow BOTH updating and inserting
  // permissions to publish an element. Useful.
  @Post(':id/publish')
  @RequirePerms(Perm.UPDATE, Perm.INSERT)
  publish(@Param('id') id: string) {
    return this.service.publish(id);
  }

  @Delete(':id')
  @RequirePerms(Perm.DELETE)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
