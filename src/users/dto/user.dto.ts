import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDTO {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email of the user',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}

export class UserRegisterDTO extends UserLoginDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'johndoe',
    description: 'The username',
  })
  @Transform(({ value }) => value?.toLocaleLowerCase())
  name: string;
}