'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface GrowthChartProps {
  data: { month: string; trees: number }[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
  const chartData = data.length > 0 ? data : [
    { month: 'Jan 26', trees: 40 },
    { month: 'Feb 26', trees: 70 },
    { month: 'Mar 26', trees: 90 },
    { month: 'Apr 26', trees: 120 },
    { month: 'May 26', trees: 180 },
    { month: 'Jun 26', trees: 210 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="currentColor" strokeOpacity={0.4} />
          <YAxis tick={{ fontSize: 10 }} stroke="currentColor" strokeOpacity={0.4} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: '12px',
              fontSize: '11px',
              color: 'var(--foreground)'
            }}
          />
          <Bar dataKey="trees" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
