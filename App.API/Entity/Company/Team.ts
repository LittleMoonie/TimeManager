
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import { Organization } from './Company';
import User from '../Users/User';

export class Team extends BaseEntity {
  @Column({ type: 'uuid' })
  orgId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ManyToOne(() => Organization, (org) => org.teams, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'orgId' })
  organization!: Organization;

  @OneToMany(() => TeamMember, (teamMember) => teamMember.team)
  members!: TeamMember[];
}

@Entity()
@Index(['orgId', 'userId', 'teamId'])
export class TeamMember extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  teamId!: string;

  @Column({ type: 'uuid' })
  orgId!: string;

  @Column({ type: 'varchar', length: 50, default: 'member' })
  role!: string;

  @ManyToOne(() => User, (user) => user.teamMembership, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Team, (team) => team.members, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'teamId' })
  team!: Team;

  @ManyToOne(() => Organization, (org) => org.teamMembers, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'orgId' })
  organization!: Organization;
}
