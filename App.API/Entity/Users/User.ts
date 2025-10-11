import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import { Company } from '../Company/Company';
import { Role } from './Role';
import { UserStatus } from './UserStatus';
import ActiveSession from './ActiveSessions';

@Entity('users')
@Index(['companyId', 'id'])
@Index(['companyId', 'email'], { unique: true })
@Index(['companyId', 'roleId'])
@Index(['companyId', 'statusId'])
export default class User extends BaseEntity {
  @Column({ type: 'uuid' }) companyId!: string;

  @ManyToOne(() => Company, (company) => company.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
  
  @Column({ type: 'citext', nullable: false }) email!: string;

  @Column({ type: 'varchar', length: 255, nullable: false }) firstName!: string;

  @Column({ type: 'varchar', length: 255, nullable: false }) lastName!: string;

  @Column({ type: 'varchar', length: 255, nullable: false }) passwordHash!: string;

  @Column({ type: 'boolean', default: false }) mustChangePasswordAtNextLogin!: boolean;

  @Column({ type: 'uuid', nullable: false }) roleId!: string;

  @ManyToOne(() => Role, (role) => role.users, { onDelete: 'RESTRICT' })
  @JoinColumn([
    { name: 'roleId', referencedColumnName: 'id' },
    { name: 'companyId', referencedColumnName: 'companyId' },
  ])
  role!: Role;

  @Column({ type: 'varchar', length: 32, nullable: true }) phoneNumber?: string; // Will need a check for E.164 format

  @Column({ type: 'timestamp with time zone', nullable: true }) lastLogin?: Date;

  @OneToMany(() => ActiveSession, (s) => s.user)
  activeSessions!: ActiveSession[];

  @Column({ type: 'uuid', nullable: false }) statusId!: string;
  
  @ManyToOne(() => UserStatus, (s) => s.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'statusId' })
  status!: UserStatus;
}
