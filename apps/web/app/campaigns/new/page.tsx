'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, CreateCampaignDto } from '@/lib/api';
import { CampaignForm } from '@/components/campaigns/CampaignForm';
import { GlassCard } from '@/components/ui';

export default function NewCampaignPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateCampaignDto) => {
    const campaign = await api.createCampaign(data);
    router.push(`/campaigns/${campaign.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/campaigns"
            className="text-sm text-white/60 hover:text-white mb-2 inline-block"
          >
            ← Back to Campaigns
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            Create New Campaign
          </h1>
          <p className="text-white/60">
            Set up a new matchback campaign to track customer attribution
          </p>
        </div>

        {/* Form */}
        <GlassCard>
          <CampaignForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Create Campaign"
          />
        </GlassCard>
      </div>
    </div>
  );
}
