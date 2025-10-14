import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '../BaseEntity';
import { Company } from '../Companies/Company';

import { MenuCard } from './MenuCard';

@Entity()
export class MenuCategory extends BaseEntity {
  @Column({ unique: true })
  @Index()
  key: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column()
  companyId: string;

  @ManyToOne(() => Company, (company) => company.menuCategories)
  company: Company;

  @OneToMany(() => MenuCard, (card) => card.category)
  cards: MenuCard[];
}
