import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserLoginDTO, UserRegisterDTO } from './dto/user.dto';
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
  @HttpCode(201)
  async create(@Body() body: UserRegisterDTO) {
    return this.service.create(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User token' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: UserLoginDTO })
  @HttpCode(200)
  async login(
    @Body() body: UserLoginDTO,
  ) {
    return this.service.login(body);
  }
}
