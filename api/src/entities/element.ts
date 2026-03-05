import { PartialType } from '@nestjs/mapped-types';

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export interface Element {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export class CreateElementDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateElementDto extends PartialType(CreateElementDto) {}
