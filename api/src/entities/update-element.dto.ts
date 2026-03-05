import { PartialType } from '@nestjs/mapped-types';
import { CreateElementDto } from './create-element.dto';

// PartialType hereda todos los campos de CreateElementDto
// pero los hace opcionales — no repetís validaciones
export class UpdateElementDto extends PartialType(CreateElementDto) {}
