import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import User from './User';
import { Company } from '../Companies/Company';

/**
 * @description Represents an active user session, typically linked to a refresh token.
 */
@Entity('active_sessions')
@Index(['companyId', 'userId'])
@Index(['tokenHash'], { unique: true })
@Index(['expiresAt'])
export default class ActiveSession extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this active session belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid' }) companyId!: string;

  /**
   * @description The company associated with this active session.
   */
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The unique identifier of the user associated with this active session.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid' }) userId!: string;

  /**
   * @description The user associated with this active session.
   */
  @ManyToOne(() => User, (user) => user.activeSessions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  /**
   * @description The SHA-256 hash of the refresh token.
   * @example "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
   */
  @Column({ type: 'text' }) tokenHash!: string;
  /**
   * @description Optional: The hash of the previous refresh token, used for refresh token rotation.
   * @example "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
   */
  @Column({ type: 'text', nullable: true }) previousTokenHash?: string;

  /**
   * @description Optional: The expiration date and time of the refresh token.
   * @example "2024-01-01T10:00:00Z"
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt?: Date;
  /**
   * @description Optional: The date and time when the session was revoked.
   * @example "2024-01-01T09:30:00Z"
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  revokedAt?: Date;
  /**
   * @description Optional: The date and time when the session was last seen active.
   * @example "2024-01-01T09:45:00Z"
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  lastSeenAt?: Date;

  /**
   * @description Optional: The IP address from which the session originated.
   * @example "192.168.1.100"
   */
  @Column({ type: 'inet', nullable: true }) ip?: string;
  /**
   * @description Optional: The user agent string of the client that initiated the session.
   * @example "Mozilla/5.0 (Windows NT 10.0)"
   */
  @Column({ type: 'text', nullable: true }) userAgent?: string;
  /**
   * @description Optional: A unique identifier for the device associated with the session.
   * @example "d1e2v3i4-c5e6i7d8-9012-3456-7890abcdef"
   */
  @Column({ type: 'text', nullable: true }) deviceId?: string;
}
