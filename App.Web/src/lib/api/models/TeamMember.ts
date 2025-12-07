/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from './Company';
import type { Team } from './Team';
import type { User } from './User';
export type TeamMember = {
    id: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdByUserId?: string;
    updatedByUserId?: string;
    companyId: string;
    company: Company;
    teamId: string;
    team: Team;
    userId: string;
    user: User;
    role: string;
};

