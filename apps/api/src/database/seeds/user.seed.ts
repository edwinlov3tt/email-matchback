import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);

  const users = [
    {
      email: 'admin@matchback.com',
      name: 'Admin User',
      role: 'admin' as const,
      isActive: true,
    },
    {
      email: 'client@tidecleaners.com',
      name: 'Tide Cleaners',
      role: 'client_viewer' as const,
      isActive: true,
    },
  ];

  await userRepo.save(users);
  console.log('✓ Users seeded successfully');
}
