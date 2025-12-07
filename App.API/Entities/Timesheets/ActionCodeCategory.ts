import { Column, Entity, ManyToOne, JoinColumn, Unique, OneToMany } from 'typeorm';

import { BaseEntity } from '../BaseEntity';
import { Company } from '../Companies/Company';
import { ActionCode } from './ActionCode';

/**
 * @description Represents a category for grouping action codes within a company.
 */
@Entity('action_code_categories')
@Unique(['companyId', 'name'])
export class ActionCodeCategory extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this category belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column('uuid') companyId!: string;

  /**
   * @description The company associated with this category.
   */
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The name of the category.
   * @example "Development"
   */
  @Column({ type: 'varchar', length: 255 }) name!: string;

  /**
   * @description The action codes belonging to this category.
   */
  @OneToMany(() => ActionCode, (actionCode) => actionCode.category)
  actionCodes!: ActionCode[];
}
