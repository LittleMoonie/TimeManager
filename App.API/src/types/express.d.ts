import { User } from '../models/user';

declare module 'express' {
  interface Request {
    requestId?: string;
    userId?: string;
    orgId?: string;
    user?: User | undefined;
  }
}
