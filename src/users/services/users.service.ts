import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceResponse } from 'src/utils/service.response';
import { Like, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findUsersByKeyword(keyword: string): Promise<ServiceResponse> {
    if (!keyword) {
      return {
        status: 400,
        payload: {},
        errors: [],
        description: 'A search parameter is required for finding users.',
      };
    }

    let users = await this.usersRepository.find({
      where: [
        { fullname: Like(`%${keyword}%`) },
        { username: Like(`%${keyword}%`) },
      ],
    });

    users = users.sort((userA, userB) =>
      userA.getPriorityNumber() > userB.getPriorityNumber() ? 1 : -1,
    );
    return { status: 200, payload: { users }, errors: [], description: 'OK' };
  }
}
