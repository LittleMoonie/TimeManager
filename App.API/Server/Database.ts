import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

import { Company } from '../Entities/Companies/Company';
import { seedUserStatuses } from '../Seeds/01-seed-user-statuses';
import { seedCompany } from '../Seeds/02-seed-company';
import { seedRolesAndPermissions } from '../Seeds/03-seed-roles-permissions';
import { seedUsers } from '../Seeds/04-seed-users';
import { seedActionCodes } from '../Seeds/05-seed-action-codes';
import { seedCompanySettings } from '../Seeds/06-seed-company-settings';

const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, DB_SSL } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASS || !DB_NAME || !DB_PORT) {
  throw new Error('❌ PostgreSQL environment variables are missing in .env');
}

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  applicationName: 'GoGoTime',
  host: DB_HOST,
  port: Number.parseInt(DB_PORT || '5432', 10),
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  synchronize: false,
  logging: true,
  entities: ['./Entities/**/*.ts'],
  migrations: ['./Migrations/**/*.ts'],
  subscribers: [],
  ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

export const AppDataSource = new DataSource(dataSourceOptions);

let seedsRun = false;

export const runSeeds = async (opts?: { force?: boolean }): Promise<void> => {
  const force = opts?.force ?? false;
  const isProduction = process.env.NODE_ENV === 'production';
  const allowProdSeeds = process.env.ALLOW_SEEDERS_IN_PRODUCTION === 'true';

  if (seedsRun && !force) return;

  if (isProduction && !allowProdSeeds) {
    console.warn(
      '🌱 Seeders skipped: NODE_ENV=production. Set ALLOW_SEEDERS_IN_PRODUCTION=true to override.',
    );
    seedsRun = true;
    return;
  }

  if (!AppDataSource.isInitialized) {
    throw new Error('Data source has not been initialised yet');
  }

  if (!force) {
    const existingCompanies = await AppDataSource.getRepository(Company).count();
    if (existingCompanies > 0) {
      console.warn('🌱 Seeders skipped: existing data detected (use force option to override).');
      seedsRun = true;
      return;
    }
  }

  console.warn('🌱 Running seeders…');
  const { statuses } = await seedUserStatuses(AppDataSource);
  const { company } = await seedCompany(AppDataSource);
  await seedCompanySettings(AppDataSource, company);
  const { roles } = await seedRolesAndPermissions(AppDataSource, company);
  await seedUsers(AppDataSource, company, roles, statuses);
  await seedActionCodes(AppDataSource, company);
  console.warn('✅ Seeders complete');

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
      console.warn(`✅ PostgreSQL connected: ${AppDataSource.options.database}`);

      if (process.env.RUN_MIGRATIONS_ON_BOOT !== 'false') {
        await AppDataSource.runMigrations();
        console.warn('✅ Database migrations executed');
      }

      const shouldRunSeeds = process.env.RUN_SEEDERS_ON_BOOT?.toLowerCase() === 'true';
      const allowProdSeeds = process.env.ALLOW_SEEDERS_IN_PRODUCTION === 'true';
      const isProduction = process.env.NODE_ENV === 'production';
      if (shouldRunSeeds) {
        if (isProduction && !allowProdSeeds) {
          console.warn(
            '🌱 Seeders skipped on boot: RUN_SEEDERS_ON_BOOT=true but NODE_ENV=production. Set ALLOW_SEEDERS_IN_PRODUCTION=true to override.',
          );
        } else {
          await runSeeds();
        }
      }
    }
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
};
