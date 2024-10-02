import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../pipes/validation.pipe';
import {
  CreateUserDto,
  createUserSchema,
  LoginUserDto,
  loginUserSchema,
} from '../users/users.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body(new ZodValidationPipe(createUserSchema)) creatUserDto: CreateUserDto,
  ) {
    return await this.authService.signup(creatUserDto);
  }

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginUserSchema)) loginUserDto: LoginUserDto,
  ) {
    return await this.authService.login(loginUserDto);
  }
}
