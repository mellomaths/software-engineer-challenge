import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Entity,
  BeforeInsert,
} from 'typeorm';

import { v4 as uuidV4 } from 'uuid';

@Entity('clients')
export class ClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly lastUpdateAt: Date;

  @Column('text', { unique: true })
  username: string;

  @Column('text')
  password: string;

  @BeforeInsert()
  generateId() {
    if (this.id) {
      return;
    }

    this.id = uuidV4();
  }
}
