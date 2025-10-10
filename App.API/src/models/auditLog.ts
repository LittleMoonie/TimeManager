
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import User from './user';

@Entity()
export class AuditLog extends BaseEntity {
  @ManyToOne(() => User)
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  action!: string;

  @Column({ type: 'varchar', length: 255 })
  entity!: string;

  @Column({ type: 'uuid' })
  entityId!: string;

  @Column({ type: 'jsonb', nullable: true })
  details?: any;
}
