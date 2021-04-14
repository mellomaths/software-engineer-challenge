import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserPriorityEntity } from './user-priority.entity';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  fullname: string;

  @Column('text')
  username: string;

  @OneToOne((type) => UserPriorityEntity, { eager: true, primary: true })
  @JoinColumn({ name: 'id', referencedColumnName: 'user_id' })
  priority: UserPriorityEntity;

  getPriorityNumber = () => {
    if (!this.priority) {
      return Number.POSITIVE_INFINITY;
    }

    return this.priority.priority_num;
  }

}
