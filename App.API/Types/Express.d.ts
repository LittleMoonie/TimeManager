import { User } from "../Entities/Users/User";
import { Company } from "../Entities/Companies/Company";

declare module "express" {
  interface Request {
    requestId?: string;
    userId?: string;
    companyId?: string;
    user?: User | undefined;
    company?: Company | undefined;
    roles?: string[] | undefined;
  }
}
