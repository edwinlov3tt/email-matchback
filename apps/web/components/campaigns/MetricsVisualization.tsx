'use client';

import { Campaign } from '@/lib/api';
import { GlassCard } from '../ui';
import { Target, TrendingUp, Users, DollarSign, BarChart3, Percent } from 'lucide-react';

interface MetricsVisualizationProps {
  campaign: Campaign;
}

export function MetricsVisualization({ campaign }: MetricsVisualizationProps) {
  const { metrics } = campaign;

  if (!metrics) {
    return null;
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const calculatePercentage = (part: number, total: number): number => {
    if (total === 0) return 0;
    return (part / total) * 100;
  };

  const inPatternPercentage =
    metrics.totalRecords && metrics.inPattern
      ? calculatePercentage(metrics.inPattern, metrics.totalRecords)
      : 0;

  const outOfPatternPercentage =
    metrics.totalRecords && metrics.outOfPattern
      ? calculatePercentage(metrics.outOfPattern, metrics.totalRecords)
      : 0;

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <GlassCard>
        <h2 className="text-xl font-semibold text-white mb-6">Campaign Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.totalRecords !== undefined && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <p className="text-sm text-white/60">Total Records</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatNumber(metrics.totalRecords)}
              </p>
            </div>
          )}

          {metrics.matchedRecords !== undefined && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-400" />
                <p className="text-sm text-white/60">Matched</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatNumber(metrics.matchedRecords)}
              </p>
            </div>
          )}

          {metrics.matchRate !== undefined && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4 text-purple-400" />
                <p className="text-sm text-white/60">Match Rate</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatPercent(metrics.matchRate)}
              </p>
            </div>
          )}

          {metrics.newCustomers !== undefined && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-yellow-400" />
                <p className="text-sm text-white/60">New Customers</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatNumber(metrics.newCustomers)}
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Pattern Analysis */}
      {(metrics.inPattern !== undefined || metrics.outOfPattern !== undefined) && (
        <GlassCard>
          <h2 className="text-xl font-semibold text-white mb-6">Pattern Analysis</h2>
          <div className="space-y-4">
            {/* In Pattern */}
            {metrics.inPattern !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-white/80">In Pattern (Regular Customers)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {formatNumber(metrics.inPattern)}
                    </span>
                    <span className="text-xs text-white/60">
                      ({inPatternPercentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                    style={{ width: `${inPatternPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Out of Pattern */}
            {metrics.outOfPattern !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white/80">Out of Pattern (Campaign Influenced)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {formatNumber(metrics.outOfPattern)}
                    </span>
                    <span className="text-xs text-white/60">
                      ({outOfPatternPercentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                    style={{ width: `${outOfPatternPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Financial Metrics */}
      {(metrics.revenue !== undefined || metrics.roas !== undefined || metrics.cac !== undefined) && (
        <GlassCard>
          <h2 className="text-xl font-semibold text-white mb-6">Financial Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.revenue !== undefined && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <p className="text-sm text-white/60">Revenue</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(metrics.revenue)}
                </p>
              </div>
            )}

            {metrics.roas !== undefined && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <p className="text-sm text-white/60">ROAS</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {metrics.roas.toFixed(2)}x
                </p>
              </div>
            )}

            {metrics.cac !== undefined && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  <p className="text-sm text-white/60">CAC</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(metrics.cac)}
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
