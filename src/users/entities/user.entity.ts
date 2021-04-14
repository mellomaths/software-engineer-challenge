import {
  Column,
  Entity,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @Column('text')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  username: string;
}
