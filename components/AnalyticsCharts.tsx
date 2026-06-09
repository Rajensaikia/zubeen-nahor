'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsChartsProps {
  data: {
    trafficData: { date: string; visitors: number; leads: number; pageViews: number }[];
    genderAnalytics: { name: string; value: number; color: string }[];
    ageAnalytics: { name: string; value: number; color: string }[];
    conversionFunnel: { stage: string; count: number; rate: number }[];
  };
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const { trafficData, genderAnalytics, ageAnalytics, conversionFunnel } = data;

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold">
        {percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
      </text>
    );
  };

  return (
    <div className="space-y-8">
      {/* 1. Traffic Area Chart */}
      <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary">
            Website Traffic & Lead Generation (visitors vs. leads)
          </h3>
          <p className="text-[11px] text-muted-foreground">30-day analytics tracking unique visitors, page views, and sign-up leads.</p>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="currentColor" strokeOpacity={0.4} />
              <YAxis tick={{ fontSize: 9 }} stroke="currentColor" strokeOpacity={0.4} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '16px',
                  fontSize: '11px',
                  color: 'var(--foreground)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                name="Unique Visitors"
                type="monotone"
                dataKey="visitors"
                stroke="var(--primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVisitors)"
              />
              <Area
                name="Leads Generated"
                type="monotone"
                dataKey="leads"
                stroke="var(--accent)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLeads)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Demographics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gender pie chart */}
        <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary">
              Gender Demographics (লিঙ্গ বিশ্লেষণ)
            </h3>
            <p className="text-[11px] text-muted-foreground">Deterministic user gender ratio breakdown based on system statistics.</p>
          </div>
          
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderAnalytics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderAnalytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age pie chart */}
        <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary">
              Age Cohort Analytics (বয়স বিশ্লেষণ)
            </h3>
            <p className="text-[11px] text-muted-foreground">User grouping statistics sorted by active demographic age categories.</p>
          </div>
          
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageAnalytics}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {ageAnalytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Conversion Funnel Chart */}
      <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary">
            Conversion Funnel Performance
          </h3>
          <p className="text-[11px] text-muted-foreground">Tracking ratios from general website visits down to active verified tree planting drives.</p>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={conversionFunnel}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis type="number" tick={{ fontSize: 9 }} stroke="currentColor" strokeOpacity={0.4} />
              <YAxis dataKey="stage" type="category" tick={{ fontSize: 9 }} width={120} stroke="currentColor" strokeOpacity={0.4} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '12px',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="rate" fill="var(--primary)" name="Conversion Rate (%)" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
