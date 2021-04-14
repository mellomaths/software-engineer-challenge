import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserPriorityEntity } from './user-priority.entity';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  username: string;

  @OneToOne((type) => UserPriorityEntity)
  @JoinColumn()
  priority: UserPriorityEntity;
}
