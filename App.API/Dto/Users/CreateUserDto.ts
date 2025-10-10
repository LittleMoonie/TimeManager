import { IsEmail, IsString, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../Entity/Users/Role';

export class CreateUserDto {
  @IsEmail()
  public email!: string;

  @IsString()
  @IsNotEmpty()
  public name!: string;

  @IsString()
  @MinLength(6)
  public password!: string;

  @IsEnum(Role)
  public role!: Role;

  @IsString()
  @IsOptional()
  public orgId?: string;
}
