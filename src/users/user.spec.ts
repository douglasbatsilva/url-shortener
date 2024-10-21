import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserRegisterDTO } from './dto/user.dto';
import { createHash } from 'crypto';
import { User } from './user.entity';

const validUser: User = {
  id: 1,
  email: 'test@example.com',
  password: createHash('sha1').update('hashed_password').digest('hex'),
  name: '',
  deletedAt: null,
  urls: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('create', () => {
    it('should throw an exception if the user already exists', async () => {
      const body: UserRegisterDTO = {
        email: 'test@example.com',
        password: 'password123',
        name: '',
      };

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(validUser);

      await expect(service.create(body)).rejects.toThrow(
        new HttpException('User already exists', HttpStatus.PRECONDITION_FAILED),
      );
    });

    describe('buildUserData', () => {
      it('should hash the password and return the updated user data', () => {
        const body: UserRegisterDTO = {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        };
  
        const expectedHash = createHash('sha1').update(body.password).digest('hex');
        const result = service.buildUserData(body);
  
        expect(result.password).toBe(expectedHash);
        expect(result.email).toBe(body.email);
        expect(result.name).toBe(body.name);
      });
    });

    it('should create a new user if email does not exist', async () => {
      const body: UserRegisterDTO = {
        email: 'test@example.com',
        password: 'password123',
        name: '',
      };

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(service, 'buildUserData').mockReturnValue({
        ...body,
        password: 'hashed_password',
      });
      jest.spyOn(repository, 'create').mockImplementation();

      await service.create(body);

      expect(repository.findByEmail).toHaveBeenCalledWith(body.email);
      expect(service.buildUserData).toHaveBeenCalledWith(body);
      expect(repository.create).toHaveBeenCalledWith({
        ...body,
        password: 'hashed_password',
      });
    });
  });

  describe('login', () => {
    it('should throw an exception if the user is not found', async () => {
      const body: Partial<UserRegisterDTO> = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);

      await expect(service.login(body)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an exception if the password is incorrect', async () => {
      const body: Partial<UserRegisterDTO> = {
        email: 'test@example.com',
        password: 'wrong_password',
      };

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(validUser);

      await expect(service.login(body)).rejects.toThrow(
        new HttpException('Invalid User or Password', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should return a JWT token if login is successful', async () => {
      const body: Partial<UserRegisterDTO> = {
        email: 'test@example.com',
        password: 'hashed_password',
      };

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(validUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock_token');

      const result = await service.login(body);

      expect(jwtService.sign).toHaveBeenCalledWith({ id: validUser.id });
      expect(result).toEqual({ token: 'mock_token' });
    });
  });
});

