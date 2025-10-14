/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MenuCardDto } from './MenuCardDto';
export type MenuCategoryDto = {
    id: string;
    key: string;
    title: string;
    icon?: string;
    sortOrder: number;
    cards: Array<MenuCardDto>;
};

