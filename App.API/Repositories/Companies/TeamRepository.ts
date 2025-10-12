import { Team } from "../../Entities/Companies/Team";
import { BaseRepository } from "../BaseRepository";
import { Service } from "typedi";

/**
 * @description Repository for managing Team entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying teams within a company scope.
 */
@Service()
export class TeamRepository extends BaseRepository<Team> {
  /**
   * @description Initializes the TeamRepository.
   * The constructor automatically passes the Team entity to the BaseRepository.
   */
  constructor() {
    super(Team);
  }

  /**
   * @description Finds all teams belonging to a specific company.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to an array of Team entities within the specified company.
   */
  async findAll(companyId: string): Promise<Team[]> {
    return this.repository.find({ where: { companyId } });
  }
}
