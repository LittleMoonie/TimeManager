import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Company } from "./Company";
import User from "../Users/User";

@Entity("teams")
@Index(["companyId", "id", "name"], { unique: true })
export class Team extends BaseEntity {
  @Column({ type: "uuid" }) companyId!: string;

  @ManyToOne(() => Company, (company) => company.teams, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column({ type: "varchar", length: 255 }) name!: string;

  @OneToMany(() => TeamMember, (tm) => tm.team)
  members!: TeamMember[];
}

@Entity("team_members")
@Index(["companyId", "teamId", "userId"], { unique: true })
export class TeamMember extends BaseEntity {
  @Column({ type: "uuid" }) companyId!: string;

  @ManyToOne(() => Company, (c) => c.teamMembers, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column({ type: "uuid" }) teamId!: string;

  @ManyToOne(() => Team, (team) => team.members, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "teamId" })
  team!: Team;

  @Column({ type: "uuid" }) userId!: string;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "varchar", length: 50, default: "member" })
  role!: string; // team-level role (lead/member)
}
