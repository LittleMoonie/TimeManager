import 'dotenv/config';
import 'reflect-metadata';
import { AppDataSource, connectDB, runSeeds } from './Database';

const seedDatabase = async () => {
  await connectDB();
  try {
    await runSeeds({ force: true });
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

seedDatabase()
  .then(() => {
    console.warn('✅ Seeding complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  });
