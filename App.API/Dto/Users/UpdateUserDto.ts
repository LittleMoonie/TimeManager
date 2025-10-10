import { IsEmail, IsString, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserStatus } from '../../Entity/Users/UserStatus';
import { Role } from '../../Entity/Users/Role';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  public email?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public name?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  public password?: string;

  @IsEnum(Role)
  @IsOptional()
  public role?: Role;

  @IsEnum(UserStatus)
  @IsOptional()
  public status?: UserStatus;
}
