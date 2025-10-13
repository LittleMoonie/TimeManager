import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Company } from "./Company";
import { Team } from "./Team";
import User from "../Users/User";

/**
 * @description Represents a member of a team, linking a user to a team within a company.
 */

@Entity("team_members")
@Index(["companyId", "teamId", "userId"], { unique: true })
export class TeamMember extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this team member association belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) companyId!: string;

  /**
   * @description The company associated with this team member.
   */
  @ManyToOne(() => Company, (c) => c.teamMembers, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The unique identifier of the team this member belongs to.
   * @example "g1h2i3j4-k5l6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) teamId!: string;

  /**
   * @description The team this member belongs to.
   */
  @ManyToOne(() => Team, (team) => team.members, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "teamId" })
  team!: Team;

  /**
   * @description The unique identifier of the user who is a member of the team.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) userId!: string;

  /**
   * @description The user who is a member of the team.
   */
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user!: User;

  /**
   * @description The role of the user within the team (e.g., "member", "lead").
   * @example "member"
   */
  @Column({ type: "varchar", length: 50, default: "member" })
  role!: string; // team-level role (lead/member)
}
