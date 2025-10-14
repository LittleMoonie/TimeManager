/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from './Company';
import type { MenuCard } from './MenuCard';
export type MenuCategory = {
    id: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdByUserId?: string;
    updatedByUserId?: string;
    key: string;
    title: string;
    icon?: string;
    sortOrder: number;
    companyId: string;
    company: Company;
    cards: Array<MenuCard>;
};

