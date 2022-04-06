import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TestModule } from './test/test.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, TestModule, AuthModule],
})
export class ApiModule {}
