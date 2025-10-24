'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, Campaign } from '@/lib/api';
import { GlassCard, GlassButton, StatusBadge } from '@/components/ui';
import { RefreshCw, Mail, Calendar, Target, TrendingUp } from 'lucide-react';

export default function CampaignDetailsPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCampaign(campaignId);
      setCampaign(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading campaign...</span>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <GlassCard className="max-w-md">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error || 'Campaign not found'}</p>
            <Link href="/campaigns">
              <GlassButton variant="secondary">Back to Campaigns</GlassButton>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/campaigns"
            className="text-sm text-white/60 hover:text-white mb-2 inline-block"
          >
            ← Back to Campaigns
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {campaign.name}
              </h1>
              <div className="flex items-center gap-3">
                <StatusBadge status={campaign.status} />
                <span className="text-white/60">•</span>
                <span className="text-white/60">{campaign.billingNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">
              Campaign Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/60 mb-1">Campaign Type</p>
                <p className="text-white capitalize">{campaign.campaignType}</p>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">Priority</p>
                <span
                  className={`inline-block px-3 py-1 text-sm rounded-lg ${
                    campaign.priority === 'urgent'
                      ? 'bg-red-500/20 text-red-300'
                      : campaign.priority === 'high'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`}
                >
                  {campaign.priority}
                </span>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">Markets</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.markets.map((market) => (
                    <span
                      key={market}
                      className="px-3 py-1 text-sm rounded-lg bg-white/10 text-white/80"
                    >
                      {market}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">Expected Records</p>
                <p className="text-white">
                  {campaign.expectedRecords?.toLocaleString() || 'Not specified'}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Dates & Contact */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">
              Dates & Contact
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white/60 mb-1">Drop Date</p>
                  <p className="text-white">{formatDate(campaign.dropDate)}</p>
                </div>
              </div>
              {campaign.redropDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-pink-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-white/60 mb-1">Redrop Date</p>
                    <p className="text-white">{formatDate(campaign.redropDate)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white/60 mb-1">Vendor Email</p>
                  <p className="text-white break-all">{campaign.vendorEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white/60 mb-1">Email Endpoint</p>
                  <p className="text-white/80 text-sm break-all font-mono">
                    {campaign.emailEndpoint}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Metrics */}
        {campaign.metrics && (
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">
              Campaign Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {campaign.metrics.totalRecords !== undefined && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <p className="text-sm text-white/60">Total Records</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {campaign.metrics.totalRecords.toLocaleString()}
                  </p>
                </div>
              )}
              {campaign.metrics.matchedRecords !== undefined && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <p className="text-sm text-white/60">Matched</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {campaign.metrics.matchedRecords.toLocaleString()}
                  </p>
                </div>
              )}
              {campaign.metrics.matchRate !== undefined && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <p className="text-sm text-white/60">Match Rate</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {(campaign.metrics.matchRate * 100).toFixed(1)}%
                  </p>
                </div>
              )}
              {campaign.metrics.newCustomers !== undefined && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <p className="text-sm text-white/60">New Customers</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {campaign.metrics.newCustomers.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Notes */}
        {campaign.notes && (
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
            <p className="text-white/80 whitespace-pre-wrap">{campaign.notes}</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
