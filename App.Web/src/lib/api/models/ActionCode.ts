/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { ActionCodeType } from './ActionCodeType';
import type { Company } from './Company';
export type ActionCode = {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdByUserId?: string;
  updatedByUserId?: string;
  companyId: string;
  company: Company;
  code: string;
  name: string;
  type: ActionCodeType;
  active: boolean;
};
