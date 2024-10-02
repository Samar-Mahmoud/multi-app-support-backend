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

  /**
   * creates a new user
   * @param {CreateUserDto} createUserDto an object that contains the necessary data for creating a user
   */
  async signup(createUserDto: CreateUserDto) {
    try {
      await this.usersService.create(createUserDto);
      return 'signed up successfully';
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  /**
   * handles user authentication by verifying email and password, then generating an access token using JWT
   * @param {LoginUserDto} loginUserDto an object that contains the email and password of the user trying to log in
   * @returns an object with an `access_token` property
   */
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
