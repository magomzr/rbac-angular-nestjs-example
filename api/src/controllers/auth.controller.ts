import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { LoginDto } from 'src/entities/login.dto';
import { AuthService } from 'src/services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // no requiere JWT
  @Post('login')
  @HttpCode(200) // por defecto POST devuelve 201, acá preferimos 200
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
