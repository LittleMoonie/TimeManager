export class ActiveSessionResponseDto {
  id!: string;
  userId!: string;
  companyId!: string;
  ip?: string;
  userAgent?: string;
  lastSeenAt?: Date;
}
