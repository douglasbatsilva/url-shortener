import { IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class ShortenUrlDto {
  @IsNotEmpty({ message: 'The URL should not be empty' })
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
