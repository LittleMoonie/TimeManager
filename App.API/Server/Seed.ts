import 'reflect-metadata';
import { AppDataSource } from './Database';
import { seedUserStatuses } from '../Seeds/01-seed-user-statuses';
import { seedCompany } from '../Seeds/02-seed-company';
import { seedRolesAndPermissions } from '../Seeds/03-seed-roles-permissions';
import { seedUsers } from '../Seeds/04-seed-users';
import { seedActionCodes } from '../Seeds/05-seed-action-codes';

const seedDatabase = async () => {
  await AppDataSource.initialize();
  try {
    console.log('🌱 Seeding…');

    const { statuses } = await seedUserStatuses(AppDataSource);
    const { company } = await seedCompany(AppDataSource);
    const { roles } = await seedRolesAndPermissions(AppDataSource, company);
    await seedUsers(AppDataSource, company, roles, statuses);
    await seedActionCodes(AppDataSource, company);

    console.log('✅ Seeding complete');
  } finally {
    await AppDataSource.destroy();
  }
};

seedDatabase().catch((err) => {
  console.error('❌ Error seeding database:', err);
  process.exit(1);
});
