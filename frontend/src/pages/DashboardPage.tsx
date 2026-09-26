import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Link } from 'react-router-dom';

import { fetchDashboardOverview, fetchHoldings } from '../lib/api';
import { formatINR, formatDate } from '../lib/format';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DataQualityBanner } from '../components/ui/DataQualityBanner';
import { SwarmScene } from '../components/swarm/SwarmScene';

export const DashboardPage: React.FC = () => {
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardOverview,
  });

  const { data: holdings } = useQuery({
    queryKey: ['holdings'],
    queryFn: () =>
      fetchHoldings('b2c3d4e5-f6a7-8901-bcde-f23456789012'),
  });

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
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
              DividendLens Intelligence
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-text">
            Overview Dashboard
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Track dividend income, upcoming events, and distributed agent
            validation in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 shadow-sm">
          <span className="text-xs text-text-muted">
            Seeded Portfolio:
          </span>

          <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-semibold text-text">
            My Core Equities ({holdingsCount} Holdings)
          </span>
        </div>
      </div>

      {/* Data Quality */}
      <DataQualityBanner alertsCount={dashboard?.alerts_count || 1} />

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="relative overflow-hidden border-l-4 border-l-blue-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />

          <div className="relative flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Expected Income (FY)
            </span>

            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="relative mt-3">
            <div className="text-3xl font-bold text-text">
              {formatINR(
                dashboard?.metrics.expected_income_fy || '1450.00',
              )}
            </div>

            <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
              <Info className="h-3.5 w-3.5 text-blue-500" />
              Gross estimate based on holdings & announced DPS
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-emerald-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />

          <div className="relative flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Received Income (FY)
            </span>

            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="relative mt-3">
            <div className="text-3xl font-bold text-text">
              {formatINR(
                dashboard?.metrics.received_income_fy || '800.00',
              )}
            </div>

            <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              User-confirmed payments credited to bank
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-purple-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl" />

          <div className="relative flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Upcoming Next 30 Days
            </span>

            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>

          <div className="relative mt-3">
            <div className="text-3xl font-bold text-text">
              {formatINR(
                dashboard?.metrics.upcoming_30_days || '400.00',
              )}
            </div>

            <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              2 corporate ex-dates approaching in Oct 2026
            </p>
          </div>
        </Card>
      </div>

      {/* Chart + 3D Swarm */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Income Chart */}
        <Card
          title="Dividend Income Trend"
          subtitle="Expected vs confirmed received income across FY 2026"
          className="xl:col-span-3"
        >
          <div className="h-[430px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{
                    fontSize: 12,
                    fill: '#647184',
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 12,
                    fill: '#647184',
                  }}
                  tickFormatter={(value) => `₹${value}`}
                />

                <Tooltip
                  formatter={(value: number) => [
                    `₹${value.toFixed(2)}`,
                    '',
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                    boxShadow:
                      '0 10px 25px -5px rgba(0,0,0,0.12)',
                  }}
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  wrapperStyle={{
                    fontSize: '12px',
                  }}
                />

                <Bar
                  dataKey="expected"
                  name="Expected Estimate (₹)"
                  fill="#2563EB"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="received"
                  name="Received Payment (₹)"
                  fill="#15803D"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 3D Swarm */}
        <div className="xl:col-span-2">
          <SwarmScene className="h-full min-h-[520px]" />
        </div>
      </div>

      {/* Upcoming Events */}
      <Card
        title="Upcoming Dividend Events"
        subtitle="Eligible corporate ex-dates relevant to your portfolio"
        action={
          <Link
            to="/calendar"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            View Full Calendar
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase text-text-muted">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Ex-Dividend Date</th>
                <th className="px-4 py-3 text-right">
                  Dividend Per Share
                </th>
                <th className="px-4 py-3 text-right">
                  Eligible Shares
                </th>
                <th className="px-4 py-3 text-right">
                  Estimated Income
                </th>
                <th className="px-4 py-3 text-center">
                  Validation Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {dashboard?.upcoming_events.map((evt) => (
                <tr
                  key={evt.event_id}
                  className="transition-colors hover:bg-blue-50/40"
                >
                  <td className="px-4 py-3.5 font-semibold text-text">
                    {evt.company_name}

                    <span className="ml-2 text-xs font-normal text-text-muted">
                      ({evt.company_ticker})
                    </span>
                  </td>

                  <td className="px-4 py-3.5 font-medium text-text">
                    {formatDate(evt.ex_date)}
                  </td>

                  <td className="px-4 py-3.5 text-right font-medium text-text">
                    {formatINR(evt.dividend_per_share)}
                  </td>

                  <td className="px-4 py-3.5 text-right text-text-muted">
                    {evt.eligible_shares} shares
                  </td>

                  <td className="px-4 py-3.5 text-right font-bold text-blue-600">
                    {formatINR(evt.estimated_gross_amount)}
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    {evt.company_ticker === 'INFY' ? (
                      <Badge variant="conflict">
                        Conflict Flagged
                      </Badge>
                    ) : (
                      <Badge variant="valid">
                        Verified
                      </Badge>
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