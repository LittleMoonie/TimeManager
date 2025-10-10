
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Timesheet } from './timesheet';

@Entity()
export class TimeEntry extends BaseEntity {
  @ManyToOne(() => Timesheet)
  timesheet!: Timesheet;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  hours!: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  code?: string;
}
