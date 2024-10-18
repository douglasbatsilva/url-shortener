import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRegisterDTO } from './dto/user.dto';

@Controller('user')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post('signup')
  @Post()
  async create(@Body() body: UserRegisterDTO) {
    return this.service.create(body);
  }

  @Post('login')
  async login(@Body() body: Partial<UserRegisterDTO>) {
    return this.service.login(body);
  }
}
