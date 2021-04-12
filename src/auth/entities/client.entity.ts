import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, Entity } from 'typeorm';

@Entity('clients')
export class ClientEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly lastUpdateAt: Date;

  @Column('text', { unique: true })
  username: string;

  @Column('text')
  password: string;

}