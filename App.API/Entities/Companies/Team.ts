import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import { Company } from './Company';
import { TeamMember } from './TeamMember';

/**
 * @description Represents a team within a company.
 */
@Entity('teams')
@Index(['companyId', 'id', 'name'], { unique: true })
export class Team extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this team belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid' }) companyId!: string;

  /**
   * @description The company associated with this team.
   */
  @ManyToOne(() => Company, (company) => company.teams, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The name of the team.
   * @example "Engineering"
   */
  @Column({ type: 'varchar', length: 255 }) name!: string;

  /**
   * @description List of members belonging to this team.
   */
  @OneToMany(() => TeamMember, (tm) => tm.team)
  members!: TeamMember[];
}
