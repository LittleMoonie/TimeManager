import { LeaveRequest } from "../../Entities/Companies/LeaveRequest";
import { BaseRepository } from "../BaseRepository";

export class LeaveRequestRepository extends BaseRepository<LeaveRequest> {
  constructor() {
    super(LeaveRequest);
  }
}
