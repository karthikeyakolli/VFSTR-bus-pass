import React from 'react';
import { BarChart, LineChart, DonutChart } from '@/components/ui/Charts';
import { StatCard } from '@/components/ui/StatCard';
import {
  Users,
  Bus,
  CreditCard,
  Clock,
  Download,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const AnalyticsPage: React.FC = () => {
  const revenueData = [
    { label: 'Jan', value: 450000, secondaryValue: 380000 },
    { label: 'Feb', value: 520000, secondaryValue: 410000 },
    { label: 'Mar', value: 610000, secondaryValue: 490000 },
    { label: 'Apr', value: 580000, secondaryValue: 460000 },
    { label: 'May', value: 720000, secondaryValue: 530000 },
    { label: 'Jun', value: 680000, secondaryValue: 590000 },
    { label: 'Jul', value: 890000, secondaryValue: 640000 },
  ];

  const passIssuanceData = [
    { label: 'Mon', value: 140 },
    { label: 'Tue', value: 210 },
    { label: 'Wed', value: 340 },
    { label: 'Thu', value: 290 },
    { label: 'Fri', value: 410 },
    { label: 'Sat', value: 180 },
    { label: 'Sun', value: 95 },
  ];

  const busOccupancyData = [
    { label: 'Guntur Express (#01)', value: 92, color: 'bg-emerald-500' },
    { label: 'Vijayawada Highway (#04)', value: 85, color: 'bg-blue-500' },
    { label: 'Tenali Shuttle (#09)', value: 78, color: 'bg-indigo-500' },
    { label: 'Mangalagiri Local (#12)', value: 64, color: 'bg-amber-500' },
    { label: 'Amaravati Special (#15)', value: 45, color: 'bg-rose-500' },
  ];

  const passStatusDistribution = [
    { label: 'Active Passes', value: 3420, color: '#10b981' },
    { label: 'Pending Approval', value: 285, color: '#f59e0b' },
    { label: 'Payment Pending', value: 142, color: '#6366f1' },
    { label: 'Expired / Rejected', value: 98, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Real-time telemetry, revenue trends, route occupancy, and pass distribution metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value="₹44,50,000"
          trend={{ value: '+14.2% vs last month', isPositive: true }}
          icon={<CreditCard className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Active Pass Holders"
          value="3,420"
          trend={{ value: '+8.5% new registrations', isPositive: true }}
          icon={<Users className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard
          title="Average Bus Occupancy"
          value="82.4%"
          trend={{ value: '+3.1% capacity utilization', isPositive: true }}
          icon={<Bus className="h-5 w-5 text-indigo-500" />}
        />
        <StatCard
          title="Pending Applications"
          value="285"
          trend={{ value: '-12% queue time reduced', isPositive: true }}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          title="Fee Collection Revenue (₹)"
          subtitle="Monthly comparison of fee collections against prior year"
          data={revenueData}
          valuePrefix="₹"
          showLegend
          legendLabels={{ primary: '2026 Revenue', secondary: '2025 Revenue' }}
        />

        <LineChart
          title="Daily Pass Approvals & Issuance"
          subtitle="Number of bus passes processed daily over the past week"
          data={passIssuanceData}
          valueSuffix=" passes"
        />
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BarChart
            title="Route Capacity Occupancy (%)"
            subtitle="Top performing routes by percentage capacity fill"
            data={busOccupancyData}
            valueSuffix="%"
          />
        </div>

        <DonutChart
          title="Pass Status Distribution"
          subtitle="Breakdown of all registered student pass statuses"
          data={passStatusDistribution}
          totalLabel="Total Registrations"
        />
      </div>
    </div>
  );
};
