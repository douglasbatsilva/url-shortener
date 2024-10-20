import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ShortenUrlDto {
  @IsNotEmpty({ message: 'The URL should not be empty' })
  @ApiProperty({
    example: 'https://www.example.com',
    description: 'The URL to shorten',
  })
  @Matches(
    /^(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g,
    { message: 'The URL is not valid' },
  )
  @Transform(({ value }: { value: string }) => {
    if (!/^https?:\/\//.test(value)) {
      return `https://${value}`;
    }
    return value;
  })
  url: string;
}

export class ShortUrlDto {
  @IsString()
  @Length(6, 6, { message: 'The short URL must be exactly 6 characters long.' })
  shortUrl: string;
}