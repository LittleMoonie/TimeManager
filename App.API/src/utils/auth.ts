import { Request } from 'express';
import jwt from 'jsonwebtoken';

interface AuthUser {
  id: string;
  orgId: string;
  role: string;
}

export function getAuthUser(req: Request): AuthUser | null {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET || '') as AuthUser;
    return {
      id: decoded.id,
      orgId: decoded.orgId,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}
