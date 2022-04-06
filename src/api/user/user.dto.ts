import { IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  public email: string;

  @IsString()
  public password: string;
}
