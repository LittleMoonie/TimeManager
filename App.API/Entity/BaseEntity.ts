import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')  id!: string;

  @VersionColumn()  version!: number;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'now()' }) createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' }) updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true }) deletedAt?: Date;

  @Column({ type: 'uuid', nullable: true }) createdByUserId?: string;

  @Column({ type: 'uuid', nullable: true }) updatedByUserId?: string;
}
