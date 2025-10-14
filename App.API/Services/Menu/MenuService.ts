import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { MenuResponseDto, MenuCategoryDto } from '../../Dtos/Menu/MenuDto';
import { MenuCard } from '../../Entities/Menu/MenuCard';
import { MenuCategory } from '../../Entities/Menu/MenuCategory';
import User from '../../Entities/Users/User';
import { RolePermissionService } from '../RoleService/RolePermissionService';

@Service()
export class MenuService {
  constructor(
    @InjectRepository(MenuCategory)
    private menuCategoryRepository: Repository<MenuCategory>,
    @InjectRepository(MenuCard)
    private menuCardRepository: Repository<MenuCard>,
  ) {}

  public async getMenuForUser(companyId: string, user: User): Promise<MenuResponseDto> {
    const userPermissionKeys = new Set(
      user.role?.rolePermissions?.map((rp) => rp.permission?.name).filter(Boolean) || [],
    );

    const categories = await this.menuCategoryRepository.find({
      where: { companyId },
      order: { sortOrder: 'ASC' },
      relations: ['cards'],
    });

    const filteredCategories: MenuCategoryDto[] = [];

    for (const category of categories) {
      const filteredCards = category.cards.filter((card) => {
        // Card must be enabled
        if (!card.isEnabled) {
          return false;
        }

        // If a required permission is specified, check if the user has it
        if (card.requiredPermission && !userPermissionKeys.has(card.requiredPermission)) {
          return false;
        }

        // TODO: Implement feature flag logic if needed
        // if (card.featureFlag && !userHasFeatureFlag(user, card.featureFlag)) {
        //   return false;
        // }

        return true;
      });

      // Only include categories that have at least one visible card
      if (filteredCards.length > 0) {
        filteredCategories.push({
          id: category.id,
          key: category.key,
          title: category.title,
          icon: category.icon,
          sortOrder: category.sortOrder,
          cards: filteredCards.map((card) => ({
            id: card.id,
            categoryKey: card.categoryKey,
            title: card.title,
            subtitle: card.subtitle,
            route: card.route,
            icon: card.icon,
            requiredPermission: card.requiredPermission,
            featureFlag: card.featureFlag,
            isEnabled: card.isEnabled,
            sortOrder: card.sortOrder,
          })),
        } as MenuCategoryDto);
      }
    }

    return { categories: filteredCategories };
  }
}
