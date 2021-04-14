import { Column, Entity } from 'typeorm';

@Entity('users_priority')
export class UserPriorityEntity {
  @Column('text')
  user_id: string;

  @Column('int')
  priority_num: string;
}
