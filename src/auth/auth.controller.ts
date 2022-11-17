import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../shared/user/user.service';
import { Payload } from '../types/payload';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    return await this.userService.findAll();
  }
  @Post('login')
  async login(@Body() userDto: LoginDTO) {
    const user = await this.userService.findByLogin(userDto);
    const payload: Payload = {
      username: user.username,
      seller: user.seller,
    };

    const token = await this.authService.signPayload(payload);

    return { user, token };
  }

  @Post('register')
  async register(@Body() userDto: RegisterDTO) {
    const user = await this.userService.create(userDto);
    const payload = {
      username: user.username,
      seller: user.seller,
    };

    const token = await this.authService.signPayload(payload);

    return { user, token };
  }
}
