// Using the @Public() decorator, the login route is excluded from the
// JwtAuthGuard, so it can be accessed without a token.

import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { Login } from 'src/entities/login';
import { AuthService } from 'src/services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: Login) {
    return this.authService.login(dto);
  }
}
