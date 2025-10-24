import { AppDataSource } from '../data-source';
import { seedCampaigns } from './campaign.seed';
import { seedUsers } from './user.seed';

async function runSeeds() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    await seedUsers(AppDataSource);
    await seedCampaigns(AppDataSource);

    console.log('✓ All seeds completed successfully');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  }
}

runSeeds();
