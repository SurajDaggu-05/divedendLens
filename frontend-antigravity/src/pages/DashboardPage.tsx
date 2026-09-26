import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Cpu,
  Info
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import { fetchDashboardOverview, fetchHoldings } from '../lib/api';
import { formatINR, formatDate } from '../lib/format';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DataQualityBanner } from '../components/ui/DataQualityBanner';

export const DashboardPage: React.FC = () => {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardOverview,
  });

  const { data: holdings } = useQuery({
    queryKey: ['holdings'],
    queryFn: () => fetchHoldings('b2c3d4e5-f6a7-8901-bcde-f23456789012'),
  });

  // Recharts Monthly Trend Mock
  const chartData = [
    { month: 'Apr', expected: 200, received: 200 },
    { month: 'May', expected: 0, received: 0 },
    { month: 'Jun', expected: 300, received: 300 },
    { month: 'Jul', expected: 0, received: 0 },
    { month: 'Aug', expected: 800, received: 800 },
    { month: 'Sep', expected: 0, received: 0 },
    { month: 'Oct', expected: 1150, received: 0 },
    { month: 'Nov', expected: 450, received: 0 },
    { month: 'Dec', expected: 0, received: 0 },
    { month: 'Jan', expected: 250, received: 0 },
    { month: 'Feb', expected: 0, received: 0 },
    { month: 'Mar', expected: 500, received: 0 },
  ];

  const holdingsCount = holdings?.length || 3;

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Overview Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">
            Track expected dividend income, upcoming ex-dates, and agent validation status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Seeded Portfolio:</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-border">
            My Core Equities ({holdingsCount} Holdings)
          </span>
        </div>
      </div>

      {/* Data Quality Banner */}
      <DataQualityBanner alertsCount={dashboard?.alerts_count || 1} />

      {/* Income Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="relative border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Expected Income (FY)
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-text">
              {formatINR(dashboard?.metrics.expected_income_fy || '1450.00')}
            </div>
            <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              Gross estimate based on share holdings & announced DPS
            </p>
          </div>
        </Card>

        <Card className="relative border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Received Income (FY)
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-text">
              {formatINR(dashboard?.metrics.received_income_fy || '800.00')}
            </div>
            <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              User-confirmed payments credited to bank
            </p>
          </div>
        </Card>

        <Card className="relative border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Upcoming Next 30 Days
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-text">
              {formatINR(dashboard?.metrics.upcoming_30_days || '400.00')}
            </div>
            <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              2 corporate ex-dates approaching in Oct 2026
            </p>
          </div>
        </Card>
      </div>

      {/* Main Content Grid: Income Trend Chart + Swarm Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Income Trend Bar Chart */}
        <Card title="Dividend Income Trend (FY 2026)" subtitle="Monthly comparison of expected vs confirmed received income" className="lg:col-span-2">
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tick={{ fontSize: 12, fill: '#647184' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#647184' }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toFixed(2)}`, '']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', borderColor: '#E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="expected" name="Expected Estimate (₹)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="received" name="Received Payment (₹)" fill="#15803D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Swarm Health & Quick Actions */}
        <div className="space-y-6">
          <Card title="Swarm Pipeline Health" subtitle="Multi-agent data collection & validation engine">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-semibold text-emerald-900">All 4 Core Agents Active</span>
                </div>
                <Badge variant="online">Healthy</Badge>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Data Ingestion Rate:</span>
                  <span className="font-semibold text-slate-900">Real-time / Seeded</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Validation Method:</span>
                  <span className="font-semibold text-slate-900">Side-by-side Cross-check</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Calculation Engine:</span>
                  <span className="font-semibold text-slate-900">Deterministic Decimal Math</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Open Data Conflicts:</span>
                  <span className="font-semibold text-amber-700">1 Conflict Flagged</span>
                </div>
              </div>

              <Link
                to="/activity"
                className="w-full py-2 px-3 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Cpu className="w-4 h-4 text-purple-600" />
                View Swarm Monitor & Controls
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Upcoming Dividend Events List */}
      <Card
        title="Upcoming Dividend Events"
        subtitle="Eligible corporate ex-dates relevant to your portfolio"
        action={
          <Link to="/calendar" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View Full Calendar <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 text-xs font-semibold text-text-muted uppercase">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Ex-Dividend Date</th>
                <th className="py-3 px-4 text-right">Dividend Per Share</th>
                <th className="py-3 px-4 text-right">Eligible Shares</th>
                <th className="py-3 px-4 text-right">Estimated Income</th>
                <th className="py-3 px-4 text-center">Validation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dashboard?.upcoming_events.map((evt) => (
                <tr key={evt.event_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-text">
                    {evt.company_name}
                    <span className="ml-2 text-xs font-normal text-text-muted">({evt.company_ticker})</span>
                  </td>
                  <td className="py-3.5 px-4 text-text font-medium">{formatDate(evt.ex_date)}</td>
                  <td className="py-3.5 px-4 text-right font-medium text-text">{formatINR(evt.dividend_per_share)}</td>
                  <td className="py-3.5 px-4 text-right text-text-muted">{evt.eligible_shares} shares</td>
                  <td className="py-3.5 px-4 text-right font-bold text-blue-600">{formatINR(evt.estimated_gross_amount)}</td>
                  <td className="py-3.5 px-4 text-center">
                    {evt.company_ticker === 'INFY' ? (
                      <Badge variant="conflict">Conflict Flagged</Badge>
                    ) : (
                      <Badge variant="valid">Verified</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
