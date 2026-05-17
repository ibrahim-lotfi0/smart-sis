'use client';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { theme } from '@/lib/theme';

interface GPAChartProps {
  data: any[];
}

export function GPAChart({ data }: GPAChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(108, 92, 231, 0.05)" />
          <XAxis 
            dataKey="semesterName" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#636E72' }}
            dy={10}
          />
          <YAxis 
            domain={[0, 4]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#636E72' }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: theme.shadows.card,
              padding: '10px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="gpa" 
            stroke={theme.colors.primary} 
            strokeWidth={4} 
            dot={{ r: 6, fill: theme.colors.primary, strokeWidth: 3, stroke: '#fff' }}
            activeDot={{ r: 8, fill: theme.colors.primary, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface AttendanceBarChartProps {
  data: any[];
}

export function AttendanceBarChart({ data }: AttendanceBarChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(108, 92, 231, 0.05)" />
          <XAxis 
            dataKey="courseCode" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#636E72' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#636E72' }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(108, 92, 231, 0.05)' }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: theme.shadows.card,
              padding: '10px'
            }}
          />
          <Bar dataKey="presentCount" radius={[6, 6, 0, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? theme.colors.primary : theme.colors.secondary} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
