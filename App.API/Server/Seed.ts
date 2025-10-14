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
    console.log('✅ Seeding complete');
  })
  .catch((err) => {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  });
