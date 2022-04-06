import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { JwtRefreshStrategy } from './jwt-refresh-strategy';
import { JwtStrategy } from './jwt-strategy';

@Module({
  imports: [PassportModule.register({}), TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [JwtRefreshStrategy, JwtStrategy],
  exports: [JwtRefreshStrategy, JwtStrategy, PassportModule],
})
export class AuthModule {}
