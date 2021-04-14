import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserPriorityEntity } from './entities/user-priority.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserPriorityEntity])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
