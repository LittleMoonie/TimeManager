import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { InitialDatabase1760310538461 } from '../Migrations/1760310538461-InitialDatabase';
import { AddColorToActionCode1760366359842 } from '../Migrations/1760366359842-AddColorToActionCode';
import typedi from 'typedi';

const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, DB_SSL } = process.env;

// Load environment variables
if (!DB_HOST || !DB_USER || !DB_PASS || !DB_NAME || !DB_PORT) {
  throw new Error('❌ PostgreSQL environment variables are missing in .env');
}

// 🧩 DataSource configuration (modern replacement for createConnection)
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: parseInt(DB_PORT || '5432', 10),
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  synchronize: false, // auto-creates tables in dev — disable in prod
  logging: true,
  entities: [
    './Entities/BaseEntity.ts',
    './Entities/**/**/**/**/**/**/**/**/**/**/**/**/**/**/**/**/**/**/*.ts',
  ],
  migrations: [InitialDatabase1760310538461, AddColorToActionCode1760366359842],
  subscribers: [],
  ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : false, // Optional for cloud DBs
});

AppDataSource.useContainer(typedi.Container);

// 🧩 Connect function
export const connectDB = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log(
        `✅ PostgreSQL connected: ${AppDataSource.options.database} (${AppDataSource.driver.database as string})`,
      );
    }
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
};
