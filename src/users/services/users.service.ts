import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserPriorityEntity } from '../entities/user-priority.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(UserPriorityEntity)
    private readonly usersPriorityRepository: Repository<UserPriorityEntity>,
  ) {}

  findUserByKeyword(keyword: string) {
    return this.usersRepository.find({ where: { name: Like(`%${keyword}%`) } });
  }
}
