import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

/**
 * @description Base entity providing common fields for all entities in the application.
 * Includes UUID primary key, versioning, creation/update timestamps, and soft-delete capabilities.
 */
export abstract class BaseEntity {
  /**
   * @description Unique identifier for the entity, generated as a UUID.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @PrimaryGeneratedColumn('uuid') id!: string;

  /**
   * @description Version number for optimistic locking.
   * Incremented automatically on each update.
   * @example 1
   */
  @VersionColumn() version!: number;

  /**
   * @description Timestamp when the entity was created.
   * Automatically set on creation.
   * @example "2023-10-27T10:00:00Z"
   */
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'now()',
  })
  createdAt!: Date;

  /**
   * @description Timestamp when the entity was last updated.
   * Automatically updated on each save.
   * @example "2023-10-27T11:30:00Z"
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' }) updatedAt!: Date;

  /**
   * @description Timestamp when the entity was soft-deleted.
   * Null if the entity is not deleted.
   * @example "2023-10-27T12:00:00Z"
   */
  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date;

  /**
   * @description ID of the user who created the entity.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid', nullable: true }) createdByUserId?: string;

  /**
   * @description ID of the user who last updated the entity.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid', nullable: true }) updatedByUserId?: string;
}
