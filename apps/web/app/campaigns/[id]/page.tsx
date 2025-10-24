'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, Campaign } from '@/lib/api';
import { GlassCard, GlassButton, StatusBadge } from '@/components/ui';
import { CampaignFileUpload } from '@/components/campaigns/CampaignFileUpload';
import { UploadedFilesList } from '@/components/campaigns/UploadedFilesList';
import { CampaignActions } from '@/components/campaigns/CampaignActions';
import { MetricsVisualization } from '@/components/campaigns/MetricsVisualization';
import { CampaignTimeline } from '@/components/campaigns/CampaignTimeline';
import { RefreshCw, Mail, Calendar } from 'lucide-react';

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
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
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
            <div className="lg:max-w-md">
              <CampaignActions campaign={campaign} onActionComplete={loadCampaign} />
            </div>
          </div>
        </div>

        {/* Campaign Info and Timeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          {/* Campaign Timeline */}
          <div className="lg:col-span-2">
            <CampaignTimeline campaign={campaign} />
          </div>
        </div>

        {/* Metrics Visualization */}
        <MetricsVisualization campaign={campaign} />

        {/* File Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Uploads */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CampaignFileUpload
                campaignId={campaignId}
                type="client-data"
                onUploadComplete={loadCampaign}
              />
              <CampaignFileUpload
                campaignId={campaignId}
                type="vendor-response"
                onUploadComplete={loadCampaign}
              />
            </div>
          </div>

          {/* Uploaded Files List */}
          <div>
            <UploadedFilesList campaignId={campaignId} />
          </div>
        </div>

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
