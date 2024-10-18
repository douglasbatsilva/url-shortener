import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findByEmailOrName(email: string, name: string): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .orWhere('user.name = :name', { name })
      .getMany();
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.repository.create(user);
    return this.repository.save(newUser);
  }
}
