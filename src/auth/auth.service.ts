import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto, LoginUserDto } from '../users/users.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    try {
      await this.usersService.create(createUserDto);
      return 'signed up successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('email not found');
    }

    const match = await compare(password, user.password);
    if (!match) {
      throw new BadRequestException('wrong credentials');
    }

    return {
      access_token: await this.jwtService.signAsync({
        sub: user._id,
        role: user.role,
      }),
    };
  }
}
