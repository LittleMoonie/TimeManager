/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from './Company';
import type { User } from './User';
export type ActiveSession = {
    id: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdByUserId?: string;
    updatedByUserId?: string;
    companyId: string;
    company: Company;
    userId: string;
    user: User;
    tokenHash: string;
    previousTokenHash?: string;
    expiresAt?: string;
    revokedAt?: string;
    lastSeenAt?: string;
    ip?: string;
    userAgent?: string;
    deviceId?: string;
};

