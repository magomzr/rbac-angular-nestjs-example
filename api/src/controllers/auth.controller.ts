// Using the @Public() decorator, the login route is excluded from the
// JwtAuthGuard, so it can be accessed without a token.

import {
  Controller,
  Post,
  Body,
  HttpCode,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { Public } from 'src/decorators/public.decorator';
import { Login } from 'src/entities/login';
import { AuthService } from 'src/services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: Login, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token } = await this.authService.login(dto);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { access_token };
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request) {
    const token = req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException('No refresh token');
    return this.authService.refresh(token);
  }
}
