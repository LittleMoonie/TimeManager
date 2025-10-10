import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  public email!: string;

  @IsString()
  @MinLength(6)
  public password!: string;

  @IsString()
  public firstName!: string;

  @IsString()
  public lastName!: string;

}
