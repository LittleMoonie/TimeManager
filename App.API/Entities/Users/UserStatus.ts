import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import User from './User';

/**
 * @description Represents a status that can be assigned to a user, controlling their access and behavior.
 */
@Entity('user_statuses')
export class UserStatus extends BaseEntity {
  /**
   * @description A unique machine-readable code for the user status (e.g., "ACTIVE", "SUSPENDED").
   * @example "ACTIVE"
   */
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  code!: string; // e.g. INVITED, ACTIVE, SUSPENDED, TERMINATED

  /**
   * @description The human-readable display name for the user status.
   * @example "Active"
   */
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  name!: string; // Display label

  /**
   * @description Optional: A detailed description of what this user status signifies.
   * @example "User is currently active and can log in."
   */
  @Column({ type: 'text', nullable: true }) description?: string;

  /**
   * @description Indicates whether users with this status are allowed to log in.
   * @example true
   */
  @Column({ type: 'boolean', default: true }) canLogin!: boolean;
  /**
   * @description Indicates whether this status is a terminal status (e.g., "terminated", "archived"), meaning further actions might be restricted.
   * @example false
   */
  @Column({ type: 'boolean', default: false }) isTerminal!: boolean;

  /**
   * @description List of users currently assigned to this status.
   */
  @OneToMany(() => User, (user) => user.status)
  users!: User[];
}
