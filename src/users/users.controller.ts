import { Controller, Post, Body, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserLoginDTO, UserRegisterDTO } from './dto/user.dto';
import { FastifyReply } from 'fastify';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('user')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post('signup')
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 412, description: 'User already exists.' })
  @ApiBody({ type: UserRegisterDTO })
  async create(@Body() body: UserRegisterDTO, @Res() reply: FastifyReply) {
    const resp = await this.service.create(body);
    reply.status(201).send(resp);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User token' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: UserLoginDTO })
  async login(
    @Body() body: UserLoginDTO,
    @Res() reply: FastifyReply,
  ) {
    const resp = await this.service.login(body);
    reply.status(200).send(resp);
  }
}
