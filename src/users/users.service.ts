import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRegisterDTO } from './dto/user.dto';
import { createHash } from 'crypto';
import { UsersRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async create(body: UserRegisterDTO): Promise<void> {
    const userData = await this.repository.findByEmail(body.email);

    if (userData?.length > 0) {
      const statusCode = HttpStatus.PRECONDITION_FAILED;
      throw new HttpException('User already exists', statusCode);
    }

    const user = this.buildUserData(body);

    this.repository.create(user);
  }

  buildUserData(body: UserRegisterDTO): UserRegisterDTO {
    const hash = createHash('sha1').update(body.password).digest('hex');

    return { ...body, password: hash };
  }

  async login(body: Partial<UserRegisterDTO>): Promise<{ token: string }>{
    const user = await this.repository.findByEmail(body.email);

    if (!user?.length) {
      throw new HttpException(
        'Invalid User or Password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const hash = createHash('sha1').update(body.password).digest('hex');

    if (hash !== user[0].password) {
      throw new HttpException(
        'Invalid User or Password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = this.jwtService.sign({ id: user[0].id });

    return { token };
  }
}
