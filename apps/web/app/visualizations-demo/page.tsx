'use client';

import { GlassCard } from '@/components/ui';
import {
  ProgressBar,
  StatCard,
  BarChart,
  DonutChart,
  DataTable,
  Column,
} from '@/components/visualization';
import {
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Mail,
  Calendar,
} from 'lucide-react';

export default function VisualizationsDemoPage() {
  // Sample data
  const barChartData = [
    { label: 'January', value: 4500 },
    { label: 'February', value: 5200 },
    { label: 'March', value: 4800 },
    { label: 'April', value: 6100 },
    { label: 'May', value: 5900 },
    { label: 'June', value: 7200 },
  ];

  const donutChartData = [
    { label: 'In Pattern', value: 2400, color: '#3B82F6' },
    { label: 'Out of Pattern', value: 1800, color: '#10B981' },
    { label: 'New Customers', value: 900, color: '#8B5CF6' },
  ];

  const tableData = [
    {
      id: '1',
      campaign: 'Summer Sale 2024',
      market: 'NYC',
      records: 5000,
      matchRate: 0.65,
      status: 'Complete',
    },
    {
      id: '2',
      campaign: 'Fall Promotion',
      market: 'LA',
      records: 3200,
      matchRate: 0.58,
      status: 'Analyzing',
    },
    {
      id: '3',
      campaign: 'Holiday Campaign',
      market: 'Chicago',
      records: 7500,
      matchRate: 0.72,
      status: 'Complete',
    },
    {
      id: '4',
      campaign: 'Spring Launch',
      market: 'Miami',
      records: 4100,
      matchRate: 0.61,
      status: 'Matching',
    },
  ];

  const tableColumns: Column<typeof tableData[0]>[] = [
    {
      key: 'campaign',
      label: 'Campaign',
      sortable: true,
    },
    {
      key: 'market',
      label: 'Market',
      sortable: true,
      align: 'center',
    },
    {
      key: 'records',
      label: 'Records',
      sortable: true,
      align: 'right',
      render: (value) => value.toLocaleString(),
    },
    {
      key: 'matchRate',
      label: 'Match Rate',
      sortable: true,
      align: 'right',
      render: (value) => `${(value * 100).toFixed(1)}%`,
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs rounded ${
            value === 'Complete'
              ? 'bg-green-500/20 text-green-300'
              : value === 'Analyzing'
              ? 'bg-yellow-500/20 text-yellow-300'
              : 'bg-blue-500/20 text-blue-300'
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Visualization Components
          </h1>
          <p className="text-white/60">
            Demo of all available data visualization components
          </p>
        </div>

        {/* Stat Cards */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Stat Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Records"
              value="25,430"
              icon={Target}
              iconColor="text-blue-400"
            />
            <StatCard
              label="Match Rate"
              value="64.5%"
              icon={TrendingUp}
              iconColor="text-green-400"
              trend={{ value: 12.5, label: 'vs last month', direction: 'up' }}
            />
            <StatCard
              label="New Customers"
              value="1,250"
              icon={Users}
              iconColor="text-purple-400"
              subtitle="This month"
            />
            <StatCard
              label="Revenue"
              value="$48,200"
              icon={DollarSign}
              iconColor="text-yellow-400"
              trend={{ value: 8.2, label: 'vs last month', direction: 'down' }}
            />
          </div>
        </section>

        {/* Progress Bars */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Progress Bars
          </h2>
          <GlassCard>
            <div className="space-y-6">
              <ProgressBar
                label="Campaign Progress"
                value={75}
                color="blue"
                size="lg"
              />
              <ProgressBar
                label="Match Rate"
                value={64.5}
                color="green"
                size="md"
              />
              <ProgressBar
                label="Processing"
                value={33}
                color="purple"
                size="sm"
              />
              <ProgressBar
                label="Email Deliverability"
                value={92}
                max={100}
                color="yellow"
              />
            </div>
          </GlassCard>
        </section>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart - Vertical */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Bar Chart (Vertical)
            </h2>
            <GlassCard>
              <BarChart
                data={barChartData}
                title="Monthly Campaign Performance"
                height={300}
                showValues
                showGrid
              />
            </GlassCard>
          </section>

          {/* Bar Chart - Horizontal */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Bar Chart (Horizontal)
            </h2>
            <GlassCard>
              <BarChart
                data={barChartData.slice(0, 4)}
                title="Top Markets"
                orientation="horizontal"
                showValues
              />
            </GlassCard>
          </section>
        </div>

        {/* Donut Chart */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Donut Chart
          </h2>
          <GlassCard>
            <DonutChart
              data={donutChartData}
              title="Customer Pattern Distribution"
              size={250}
              thickness={40}
              showLegend
              showPercentages
              centerContent={
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">5,100</p>
                  <p className="text-sm text-white/60">Total</p>
                </div>
              }
            />
          </GlassCard>
        </section>

        {/* Data Table */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Data Table
          </h2>
          <GlassCard>
            <DataTable
              data={tableData}
              columns={tableColumns}
              keyExtractor={(row) => row.id}
              striped
              hoverable
            />
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
