import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common';
import { UserDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;

  @Get(':id')
  public getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.service.getUser(id);
  }

  @Post('/signup')
  public createUser(@Body() body: UserDto): Promise<User | HttpException> {
    return this.service.createUser(body);
  }

  @Post('/signin')
  public async signIn(@Res() response, @Body() body: UserDto): Promise<User> {
    const res = await this.service.signin(body);
    return response.status(HttpStatus.OK).json(res);
  }
}
