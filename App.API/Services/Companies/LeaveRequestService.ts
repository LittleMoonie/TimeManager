import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { LeaveRequest } from "../../Entities/Companies/LeaveRequest";
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
} from "../../Dtos/Company/LeaveRequestDto";
import { NotFoundError } from "../../Errors/HttpErrors";
import User from "../../Entities/Users/User";

@Service()
export class LeaveRequestService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
  ) {}

  public async createLeaveRequest(
    actingUser: User,
    companyId: string,
    createLeaveRequestDto: CreateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const leaveRequest = this.leaveRequestRepository.create({
      ...createLeaveRequestDto,
      companyId,
      userId: actingUser.id,
    });
    return this.leaveRequestRepository.save(leaveRequest);
  }

  public async getLeaveRequestById(
    companyId: string,
    id: string,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id, companyId },
    });
    if (!leaveRequest) {
      throw new NotFoundError("Leave request not found");
    }
    return leaveRequest;
  }

  public async getAllLeaveRequests(companyId: string): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({ where: { companyId } });
  }

  public async updateLeaveRequest(
    actingUser: User,
    companyId: string,
    id: string,
    updateLeaveRequestDto: UpdateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.getLeaveRequestById(companyId, id);
    // Add authorization logic here if needed
    Object.assign(leaveRequest, updateLeaveRequestDto);
    return this.leaveRequestRepository.save(leaveRequest);
  }

  public async deleteLeaveRequest(
    actingUser: User,
    companyId: string,
    id: string,
  ): Promise<void> {
    const leaveRequest = await this.getLeaveRequestById(companyId, id);
    // Add authorization logic here if needed
    await this.leaveRequestRepository.remove(leaveRequest);
  }
}
