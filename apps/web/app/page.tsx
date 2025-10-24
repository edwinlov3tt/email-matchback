'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Campaign, CampaignStats } from '@/lib/api';
import { StatCard } from '@/components/dashboard/StatCard';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { GlassButton, GlassCard } from '@/components/ui';
import {
  LayoutDashboard,
  TrendingUp,
  Target,
  Activity,
  Plus,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, campaignsData] = await Promise.all([
        api.getCampaignStats(),
        api.getCampaigns(),
      ]);
      setStats(statsData);
      setRecentCampaigns(campaignsData.slice(0, 5)); // Most recent 5
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <GlassCard className="max-w-md">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <GlassButton onClick={loadData} variant="secondary">
              Try Again
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Matchback Dashboard
            </h1>
            <p className="text-white/60">
              Campaign performance and analytics overview
            </p>
          </div>
          <Link href="/campaigns/new">
            <GlassButton>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </GlassButton>
          </Link>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Campaigns"
              value={stats.total}
              icon={LayoutDashboard}
              subtitle="All time"
            />
            <StatCard
              title="Active"
              value={
                (stats.byStatus.collecting || 0) +
                (stats.byStatus.matching || 0) +
                (stats.byStatus.analyzing || 0)
              }
              icon={Activity}
              subtitle="In progress"
            />
            <StatCard
              title="Completed"
              value={stats.byStatus.complete || 0}
              icon={Target}
              subtitle="Successfully processed"
            />
            <StatCard
              title="Acquisition"
              value={stats.byType.acquisition || 0}
              icon={TrendingUp}
              subtitle="Campaign type"
            />
          </div>
        )}

        {/* Status Breakdown */}
        {stats && (
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">
              Status Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div
                  key={status}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <p className="text-sm text-white/60 capitalize mb-1">{status}</p>
                  <p className="text-2xl font-bold text-white">{count}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Recent Campaigns */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Recent Campaigns
            </h2>
            <Link href="/campaigns">
              <GlassButton variant="ghost" size="sm">
                View All
              </GlassButton>
            </Link>
          </div>
          {recentCampaigns.length > 0 ? (
            <CampaignTable campaigns={recentCampaigns} />
          ) : (
            <div className="text-center py-12">
              <p className="text-white/60 mb-4">No campaigns yet</p>
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
