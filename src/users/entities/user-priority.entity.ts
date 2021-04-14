import { Entity, PrimaryColumn } from 'typeorm';

@Entity('users_priority')
export class UserPriorityEntity {
  @PrimaryColumn('text')
  user_id: string;

  @PrimaryColumn('int')
  priority_num: number;
}
