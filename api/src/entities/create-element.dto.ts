import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateElementDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
