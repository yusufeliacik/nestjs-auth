import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { JwtAuthenticationGuard } from '../auth/jwt-authentication.guard';
import { TestService } from './test.service';

@UseGuards(JwtAuthenticationGuard)
@Controller('test')
export class TestController {
  @Inject(TestService)
  private readonly service: TestService;

  @Get('/')
  public getUser(): Promise<string> {
    return this.service.test();
  }
}
