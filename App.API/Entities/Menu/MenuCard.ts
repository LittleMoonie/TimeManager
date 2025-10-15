import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { BaseEntity } from '../BaseEntity';
import { Company } from '../Companies/Company';

import { MenuCategory } from './MenuCategory';

@Entity()
export class MenuCard extends BaseEntity {
  @Column()
  categoryKey: string;

  @Column()
  title: string;

  @Column()
  subtitle: string;

  @Column()
  route: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ nullable: true })
  requiredPermission?: string;

  @Column({ nullable: true })
  featureFlag?: string;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Column()
  companyId: string;

  @ManyToOne(() => Company, (company) => company.menuCards)
  company: Company;

  @ManyToOne(() => MenuCategory, (category) => category.cards)
  category: MenuCategory;
}
