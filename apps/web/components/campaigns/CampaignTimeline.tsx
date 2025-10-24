'use client';

import { Campaign } from '@/lib/api';
import { GlassCard } from '../ui';
import {
  Calendar,
  Upload,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Mail,
  Clock
} from 'lucide-react';

interface CampaignTimelineProps {
  campaign: Campaign;
}

interface TimelineEvent {
  date: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'upcoming';
  color: string;
}

export function CampaignTimeline({ campaign }: CampaignTimelineProps) {
  const getTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const now = new Date();

    // Campaign Created
    events.push({
      date: campaign.createdAt,
      label: 'Campaign Created',
      description: 'Campaign setup completed',
      icon: <CheckCircle className="w-4 h-4" />,
      status: 'completed',
      color: 'green',
    });

    // Drop Date
    const dropDate = new Date(campaign.dropDate);
    events.push({
      date: campaign.dropDate,
      label: 'Drop Date',
      description: 'Email campaign sent to customers',
      icon: <Mail className="w-4 h-4" />,
      status: dropDate <= now ? 'completed' : 'upcoming',
      color: 'blue',
    });

    // Status-based events
    const statusEvents: Record<string, {
      label: string;
      description: string;
      icon: React.ReactNode;
      color: string;
    }> = {
      collecting: {
        label: 'Collecting Data',
        description: 'Client data uploaded',
        icon: <Upload className="w-4 h-4" />,
        color: 'blue',
      },
      matching: {
        label: 'Vendor Matching',
        description: 'Vendor response received',
        icon: <RefreshCw className="w-4 h-4" />,
        color: 'purple',
      },
      analyzing: {
        label: 'Analyzing Results',
        description: 'Pattern analysis in progress',
        icon: <BarChart3 className="w-4 h-4" />,
        color: 'yellow',
      },
      complete: {
        label: 'Analysis Complete',
        description: 'Report generated and ready',
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'green',
      },
      error: {
        label: 'Error',
        description: 'Processing error occurred',
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'red',
      },
    };

    // Add current status event if not pending
    if (campaign.status !== 'pending' && statusEvents[campaign.status]) {
      const statusEvent = statusEvents[campaign.status];
      events.push({
        date: campaign.updatedAt,
        label: statusEvent.label,
        description: statusEvent.description,
        icon: statusEvent.icon,
        status: 'current',
        color: statusEvent.color,
      });
    }

    // Redrop Date (if applicable)
    if (campaign.redropDate) {
      const redropDate = new Date(campaign.redropDate);
      events.push({
        date: campaign.redropDate,
        label: 'Redrop Date',
        description: 'Follow-up campaign scheduled',
        icon: <Mail className="w-4 h-4" />,
        status: redropDate <= now ? 'completed' : 'upcoming',
        color: 'pink',
      });
    }

    // Sort by date
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[color] || colors.gray;
  };

  const getStatusDotColor = (status: string, color: string) => {
    if (status === 'completed') return `bg-${color}-400`;
    if (status === 'current') return `bg-${color}-400 animate-pulse`;
    return 'bg-gray-500/50';
  };

  const events = getTimelineEvents();

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-semibold text-white">Campaign Timeline</h2>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="relative">
            {/* Connector Line */}
            {index < events.length - 1 && (
              <div className="absolute left-[11px] top-8 w-0.5 h-full bg-white/10" />
            )}

            <div className="flex gap-4">
              {/* Icon */}
              <div
                className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 ${getStatusColor(
                  event.color
                )}`}
              >
                {event.icon}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">
                        {event.label}
                      </h3>
                      {event.status === 'current' && (
                        <span className="px-2 py-0.5 text-xs rounded bg-purple-500/20 text-purple-300">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/60">{event.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-white/80">
                      {formatDate(event.date)}
                    </p>
                    <p className="text-xs text-white/50">{formatTime(event.date)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
