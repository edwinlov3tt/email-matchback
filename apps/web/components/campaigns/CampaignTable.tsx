'use client';

import Link from 'next/link';
import { Campaign } from '@/lib/api';
import { StatusBadge } from '@/components/ui';
import { Eye, Trash2 } from 'lucide-react';

interface CampaignTableProps {
  campaigns: Campaign[];
  onDelete?: (id: string) => void;
}

export function CampaignTable({ campaigns, onDelete }: CampaignTableProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">No campaigns found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-4 px-4 text-sm font-medium text-white/60">Campaign</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-white/60">Markets</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-white/60">Type</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-white/60">Drop Date</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-white/60">Status</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-white/60">Priority</th>
            <th className="text-right py-4 px-4 text-sm font-medium text-white/60">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr
              key={campaign.id}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="py-4 px-4">
                <div>
                  <p className="text-white font-medium">{campaign.name}</p>
                  <p className="text-sm text-white/50">{campaign.billingNumber}</p>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex flex-wrap gap-1">
                  {campaign.markets.map((market) => (
                    <span
                      key={market}
                      className="px-2 py-1 text-xs rounded-lg bg-white/10 text-white/80"
                    >
                      {market}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="text-white/80 capitalize text-sm">
                  {campaign.campaignType}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-white/80 text-sm">
                  {formatDate(campaign.dropDate)}
                </span>
              </td>
              <td className="py-4 px-4">
                <StatusBadge status={campaign.status} />
              </td>
              <td className="py-4 px-4">
                <span
                  className={`px-2 py-1 text-xs rounded-lg ${
                    campaign.priority === 'urgent'
                      ? 'bg-red-500/20 text-red-300'
                      : campaign.priority === 'high'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`}
                >
                  {campaign.priority}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4 text-white/60" />
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(campaign.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      title="Delete campaign"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
