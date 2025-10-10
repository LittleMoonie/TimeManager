
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Organization } from './organization';
import User from './user';

@Entity()
export class Team extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ManyToOne(() => Organization, (org) => org.teams)
  organization!: Organization;

  @OneToMany(() => TeamMember, (teamMember) => teamMember.team)
  members!: TeamMember[];
}

@Entity()
export class TeamMember {
  @PrimaryColumn('uuid')
  userId!: string;

  @PrimaryColumn('uuid')
  teamId!: string;

  @Column({ type: 'varchar', length: 50, default: 'member' })
  role!: string;

  @ManyToOne(() => User, (user) => user.teamMembership)
  user!: User;

  @ManyToOne(() => Team, (team) => team.members)
  team!: Team;
}
