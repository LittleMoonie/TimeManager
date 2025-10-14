import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

import { InitialDatabase1760310538461 } from '../Migrations/1760310538461-InitialDatabase';
import { AddColorToActionCode1760366359842 } from '../Migrations/1760366359842-AddColorToActionCode';
import { seedUserStatuses } from '../Seeds/01-seed-user-statuses';
import { seedCompany } from '../Seeds/02-seed-company';
import { seedRolesAndPermissions } from '../Seeds/03-seed-roles-permissions';
import { seedUsers } from '../Seeds/04-seed-users';
import { seedActionCodes } from '../Seeds/05-seed-action-codes';

const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, DB_SSL } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASS || !DB_NAME || !DB_PORT) {
  throw new Error('❌ PostgreSQL environment variables are missing in .env');
}

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  applicationName: 'GoGoTime',
  host: DB_HOST,
  port: parseInt(DB_PORT || '5432', 10),
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  synchronize: false,
  logging: true,
  entities: [
    './Entities/BaseEntity.ts',
    './Entities/**/**/**/**/**/**/**/**/**/**/**/**/**/**/**/**/**/**/*.ts',
  ],
  migrations: [InitialDatabase1760310538461, AddColorToActionCode1760366359842],
  subscribers: [],
  ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

export const AppDataSource = new DataSource(dataSourceOptions);

let seedsRun = false;

export const runSeeds = async (opts?: { force?: boolean }): Promise<void> => {
  const force = opts?.force ?? false;

  if (seedsRun && !force) return;

  if (!AppDataSource.isInitialized) {
    throw new Error('Data source has not been initialised yet');
  }

  console.log('🌱 Running seeders…');
  const { statuses } = await seedUserStatuses(AppDataSource);
  const { company } = await seedCompany(AppDataSource);
  const { roles } = await seedRolesAndPermissions(AppDataSource, company);
  await seedUsers(AppDataSource, company, roles, statuses);
  await seedActionCodes(AppDataSource, company);
  console.log('✅ Seeders complete');

  seedsRun = true;
};

export const getInitializedDataSource = (): DataSource => {
  if (!AppDataSource.isInitialized) {
    throw new Error('Data source has not been initialised yet');
  }

  return AppDataSource;
};

export const connectDB = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log(
        `✅ PostgreSQL connected: ${AppDataSource.options.database} (${AppDataSource.driver.database as string})`,
      );

      if (process.env.RUN_MIGRATIONS_ON_BOOT !== 'false') {
        await AppDataSource.runMigrations();
        console.log('✅ Database migrations executed');
      }

      if (process.env.RUN_SEEDERS_ON_BOOT !== 'false') {
        await runSeeds();
      }
    }
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
};
