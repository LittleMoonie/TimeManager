import type { Request } from "express";
import jwt from "jsonwebtoken";

type JwtPayload = { sub: string; companyId: string; role?: string };

export async function expressAuthentication(
  request: Request,
  name: string,
  scopes?: string[]
): Promise<any> {
  // name will be "jwt" (from your securityDefinitions)
  if (name !== "jwt") throw new Error("Unsupported security scheme");

  const header = request.headers.authorization;
  const cookie = (request as any).cookies?.jwt;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : cookie;

  if (!token) {
    throw Object.assign(new Error("No token"), { status: 401 });
  }

  // Verify (replace with your secret/opts)
  const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

  // Optionally enforce scopes/roles
  if (scopes?.length) {
    // simple example: check role in payload
    if (!payload.role || !scopes.includes(payload.role)) {
      throw Object.assign(new Error("Forbidden"), { status: 403 });
    }
  }

  // Attach to request if you like (tsoa will also get the value as "user")
  (request as any).user = {
    id: payload.sub,
    companyId: payload.companyId,
    role: payload.role,
  };

  return (request as any).user;
}
