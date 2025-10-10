import { User } from '../models/user';
import { Organization } from '../models/organization';

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
