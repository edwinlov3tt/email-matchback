'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, Campaign } from '@/lib/api';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { GlassButton, GlassCard } from '@/components/ui';
import { Plus, RefreshCw, Filter } from 'lucide-react';

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCampaigns(
        statusFilter ? { status: statusFilter } : undefined
      );
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await api.deleteCampaign(id);
      await loadCampaigns();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete campaign');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading campaigns...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm text-white/60 hover:text-white mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">All Campaigns</h1>
            <p className="text-white/60">Manage and monitor your campaigns</p>
          </div>
          <Link href="/campaigns/new">
            <GlassButton>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </GlassButton>
          </Link>
        </div>

        {/* Filters */}
        <GlassCard>
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-white/60" />
            <div className="flex-1">
              <label className="text-sm text-white/60 mb-2 block">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/50 transition-all duration-200"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="collecting">Collecting</option>
                <option value="matching">Matching</option>
                <option value="analyzing">Analyzing</option>
                <option value="complete">Complete</option>
                <option value="error">Error</option>
              </select>
            </div>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setStatusFilter('')}
            >
              Clear Filters
            </GlassButton>
          </div>
        </GlassCard>

        {/* Campaigns Table */}
        <GlassCard>
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <GlassButton onClick={loadCampaigns} variant="secondary">
                Try Again
              </GlassButton>
            </div>
          ) : campaigns.length > 0 ? (
            <CampaignTable campaigns={campaigns} onDelete={handleDelete} />
          ) : (
            <div className="text-center py-12">
              <p className="text-white/60 mb-4">
                {statusFilter
                  ? `No campaigns with status "${statusFilter}"`
                  : 'No campaigns yet'}
              </p>
              <Link href="/campaigns/new">
                <GlassButton>Create Your First Campaign</GlassButton>
              </Link>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
