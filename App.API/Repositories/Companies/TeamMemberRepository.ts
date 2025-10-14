import Container, { Service } from 'typedi';
import { TeamMember } from '../../Entities/Companies/TeamMember';
import { BaseRepository } from '../../Repositories/BaseRepository';

/**
 * @description Repository for managing TeamMember entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying team members within a company and team scope.
 */
export class TeamMemberRepository extends BaseRepository<TeamMember> {
  /**
   * @description Initializes the TeamMemberRepository.
   * The constructor automatically passes the TeamMember entity to the BaseRepository.
   */
  constructor() {
    super(TeamMember);
  }

  /**
   * @description Finds all team members belonging to a specific team within a given company.
   * @param companyId The unique identifier of the company.
   * @param teamId The unique identifier of the team.
   * @returns A Promise that resolves to an array of TeamMember entities, including their associated user and team relations.
   */
  async findAllForTeam(companyId: string, teamId: string): Promise<TeamMember[]> {
    return this.repository.find({
      where: { companyId, teamId },
      relations: ['user', 'team'],
    });
  }

  /**
   * @description Finds a specific team member by their user ID, team ID, and company ID.
   * @param companyId The unique identifier of the company.
   * @param teamId The unique identifier of the team.
   * @param userId The unique identifier of the user who is a team member.
   * @returns A Promise that resolves to the matching TeamMember entity or null if not found.
   */
  async findByTeamAndUser(
    companyId: string,
    teamId: string,
    userId: string,
  ): Promise<TeamMember | null> {
    return this.repository.findOne({ where: { companyId, teamId, userId } });
  }
}

Container.set('TeamMemberRepository', TeamMemberRepository);
