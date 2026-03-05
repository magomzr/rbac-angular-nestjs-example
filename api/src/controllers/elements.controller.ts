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
import { CreateElementDto } from 'src/entities/create-element.dto';
import { UpdateElementDto } from 'src/entities/update-element.dto';

// Si usás APP_GUARD global en AppModule podés quitar el @UseGuards de acá.
// Lo dejamos explícito para que sea claro qué protege cada controller.
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
    // req.user viene de JwtStrategy.validate()
    return this.service.create(dto, req.user.sub);
  }

  @Patch(':id')
  @RequirePerms(Perm.UPDATE)
  update(@Param('id') id: string, @Body() dto: UpdateElementDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/publish')
  @RequirePerms(Perm.UPDATE, Perm.INSERT) // requiere ambos
  publish(@Param('id') id: string) {
    return this.service.publish(id);
  }

  @Delete(':id')
  @RequirePerms(Perm.DELETE)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
