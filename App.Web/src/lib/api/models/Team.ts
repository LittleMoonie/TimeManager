/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from './Company';
import type { TeamMember } from './TeamMember';
export type Team = {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdByUserId?: string;
  updatedByUserId?: string;
  companyId: string;
  company: Company;
  name: string;
  members: Array<TeamMember>;
};
