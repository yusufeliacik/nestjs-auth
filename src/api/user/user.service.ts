import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './user.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { refreshSecret, secret } from 'src/constants';

type SigninResponseType =
  | {
      access_token: string;
      refresh_token: string;
      user: object;
    }
  | HttpException;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  getUser(id: number): Promise<User> {
    return this.repository.findOne(id);
  }

  async createUser(body: UserDto): Promise<User | HttpException> {
    const user: User = new User();
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(body.password, salt);

    user.name = body.name;
    user.email = body.email;
    user.password = hash;

    const userCheck = await this.repository.findOne({ email: body.email });

    if (userCheck) {
      return new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    return this.repository.save(user);
  }

  async signin(user: UserDto): Promise<SigninResponseType> {
    const foundUser = await this.repository.findOne({ email: user.email });

    if (foundUser) {
      const { password } = foundUser;
      if (bcrypt.compare(user.password, password)) {
        const payload = { email: user.email };

        const accessToken = await this.getAccessToken(payload);
        const refreshToken = await this.getRefreshToken(payload);

        await this.updateRefreshTokenInUser(refreshToken, user.email);

        return {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: user,
        };
      }
      return new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
    }
    return new HttpException('User not found.', HttpStatus.UNAUTHORIZED);
  }

  async signOut(user: User) {
    await this.updateRefreshTokenInUser(null, user.email);
  }

  async getAccessToken(payload: object) {
    const accessToken = this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: 60,
    });

    return accessToken;
  }

  async getRefreshToken(payload: object) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: 120,
    });

    return refreshToken;
  }

  async updateRefreshTokenInUser(refreshToken: string, email: string) {
    if (refreshToken) {
      refreshToken = await bcrypt.hash(refreshToken, 10);
    }

    await this.repository.update(
      { email: email },
      {
        hashedRefreshToken: refreshToken,
      },
    );
  }

  async getNewAccessAndRefreshToken(payload: User) {
    const refreshToken = await this.getRefreshToken(payload);
    await this.updateRefreshTokenInUser(refreshToken, payload.email);

    return {
      accessToken: await this.getAccessToken(payload),
      refreshToken: refreshToken,
    };
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, email: string) {
    const user = await this.repository.findOne({ email: email });

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      await this.updateRefreshTokenInUser(null, email);
      return user;
    } else {
      throw new UnauthorizedException();
    }
  }
}
