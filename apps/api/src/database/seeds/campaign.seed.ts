import { DataSource } from 'typeorm';
import { Campaign } from '../../campaigns/entities/campaign.entity';

export async function seedCampaigns(dataSource: DataSource): Promise<void> {
  const campaignRepo = dataSource.getRepository(Campaign);

  const campaigns = [
    {
      name: 'September 2024 Houston',
      billingNumber: 'TIDE123',
      dropDate: new Date('2024-09-08'),
      markets: ['Houston'],
      emailEndpoint: 'TIDE123-sep2024-12345@matchbacktool.com',
      status: 'pending' as const,
      campaignType: 'acquisition' as const,
      priority: 'normal' as const,
      vendorEmail: 'vendor@leadme.com',
      expectedRecords: 10000,
    },
    {
      name: 'October 2024 Austin',
      billingNumber: 'TIDE124',
      dropDate: new Date('2024-10-15'),
      markets: ['Austin'],
      emailEndpoint: 'TIDE124-oct2024-12346@matchbacktool.com',
      status: 'pending' as const,
      campaignType: 'winback' as const,
      priority: 'high' as const,
      vendorEmail: 'vendor@leadme.com',
      expectedRecords: 8000,
    },
  ];

  await campaignRepo.save(campaigns);
  console.log('✓ Campaigns seeded successfully');
}
