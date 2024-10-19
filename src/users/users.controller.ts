import { Controller, Post, Body, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRegisterDTO } from './dto/user.dto';
import { FastifyReply } from 'fastify';

@Controller('user')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post('signup')
  @Post()
  async create(@Body() body: UserRegisterDTO, @Res() reply: FastifyReply) {
    const resp = await this.service.create(body);
    reply.status(201).send(resp);
  }

  @Post('login')
  async login(@Body() body: Partial<UserRegisterDTO>, @Res() reply: FastifyReply) {
    const resp = await this.service.login(body);
    reply.status(200).send(resp);
  }
}
