import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Company } from './Company';

export enum ApproverPolicy {
  MANAGER_OF_USER = 'manager_of_user',
  ROLE_MANAGER    = 'role=Manager',
  EXPLICIT        = 'explicit',
}

@Entity('company_settings')
export class CompanySettings {
  @PrimaryColumn('uuid') companyId!: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column({ type: 'text', default: 'UTC' }) timezone!: string;
  // Example: {"mon":[9,17], "tue":[9,17], ..., "sun":[]}
  @Column({ type: 'jsonb', default: () => `'{}'` }) workWeek!: Record<string, number[]>;
  @Column({ type: 'text', nullable: true }) holidayCalendar?: string;

  @Column({ type: 'varchar', length: 32, default: ApproverPolicy.MANAGER_OF_USER })
  timesheetApproverPolicy!: ApproverPolicy;

  @Column({ type: 'text', array: true, nullable: true }) allowedEmailDomains?: string[];

  @Column({ type: 'boolean', default: false }) requireCompanyEmail!: boolean;
}
