'use client';

import { useState } from 'react';
import { api, Campaign } from '@/lib/api';
import { GlassButton } from '../ui';
import { Play, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface CampaignActionsProps {
  campaign: Campaign;
  onActionComplete?: () => void;
}

export function CampaignActions({ campaign, onActionComplete }: CampaignActionsProps) {
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProcessCampaign = async () => {
    try {
      setProcessing(true);
      setMessage(null);
      await api.processCampaign(campaign.id);
      setMessage({ type: 'success', text: 'Campaign processing started successfully' });
      onActionComplete?.();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to process campaign',
      });
    } finally {
      setProcessing(false);
    }
  };

  const canProcess = () => {
    return campaign.status === 'matching' || campaign.status === 'collecting';
  };

  const canDownloadReport = () => {
    return campaign.status === 'complete';
  };

  const getProcessButtonText = () => {
    if (processing) return 'Processing...';
    if (campaign.status === 'collecting') return 'Process Client Data';
    if (campaign.status === 'matching') return 'Process Matches';
    if (campaign.status === 'analyzing') return 'Processing...';
    return 'Process Campaign';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <GlassButton
          onClick={handleProcessCampaign}
          disabled={!canProcess() || processing}
          className="flex items-center gap-2"
        >
          {processing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {getProcessButtonText()}
        </GlassButton>

        <GlassButton
          variant="secondary"
          disabled={!canDownloadReport()}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Report
        </GlassButton>
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p
              className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {message.type === 'success' ? 'Success' : 'Error'}
            </p>
            <p className="text-sm text-white/60 mt-1">{message.text}</p>
          </div>
        </div>
      )}

      {!canProcess() && campaign.status !== 'complete' && campaign.status !== 'analyzing' && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-400">Upload Required</p>
            <p className="text-sm text-white/60 mt-1">
              {campaign.status === 'pending'
                ? 'Upload client data file to begin processing'
                : 'Upload vendor response file to continue'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
