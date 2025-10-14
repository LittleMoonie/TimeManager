/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from './Company';
import type { MenuCategory } from './MenuCategory';
export type MenuCard = {
    id: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdByUserId?: string;
    updatedByUserId?: string;
    categoryKey: string;
    title: string;
    subtitle: string;
    route: string;
    icon?: string;
    requiredPermission?: string;
    featureFlag?: string;
    isEnabled: boolean;
    sortOrder: number;
    companyId: string;
    company: Company;
    category: MenuCategory;
};

