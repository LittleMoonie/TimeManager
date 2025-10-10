import { User } from '../Entity/Users/User';
import { Organization } from '../Entity/Company/Company';

declare module 'express' {
  interface Request {
    requestId?: string;
    userId?: string;
    orgId?: string;
    user?: User | undefined;
    organization?: Organization | undefined;
    roles?: string[] | undefined;
  }
}
