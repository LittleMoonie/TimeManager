import { Column, Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

@Entity()
export default class User extends BaseEntity {
  @Column({ type: 'varchar', length: 50, nullable: false })
  username!: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role!: UserRole;
}
