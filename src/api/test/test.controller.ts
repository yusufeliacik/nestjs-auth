import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthenticationGuard } from '../auth/jwt-authentication.guard';
import { TestService } from './test.service';

@Controller('test')
@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
export class TestController {
  @Inject(TestService)
  private readonly service: TestService;

  @Get('/')
  public getUser(): Promise<string> {
    return this.service.test();
  }
}
