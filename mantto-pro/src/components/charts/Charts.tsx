// ============================================================
//  Charts — wrappers de Recharts con el tema del sistema.
//  Componentes reutilizables: AreaTrend, GroupedBars, Donut,
//  HorizontalBars, DualLine.
// ============================================================

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const AXIS = { stroke: '#62718f', fontSize: 11 };
const GRID = '#1a2540';

const tooltipStyle = {
  background: '#162038',
  border: '1px solid #22304f',
  borderRadius: 10,
  fontSize: 12,
  color: '#e8edf7',
};

export const CHART_COLORS = ['#2f6bff', '#ff7a18', '#22c98a', '#9d7bff', '#3b9dff', '#f5b53d'];

export function AreaTrend({
  data,
  xKey,
  series,
}: {
  data: Record<string, number | string>[];
  xKey: string;
  series: { key: string; color: string; label: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} {...AXIS} tickLine={false} axisLine={false} />
        <YAxis {...AXIS} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2.4}
            fill={`url(#grad-${s.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function GroupedBars({
  data,
  xKey,
  series,
}: {
  data: Record<string, number | string>[];
  xKey: string;
  series: { key: string; color: string; label: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} {...AXIS} tickLine={false} axisLine={false} />
        <YAxis {...AXIS} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[5, 5, 0, 0]} maxBarSize={26} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({
  data,
  dataKey,
  nameKey,
}: {
  data: Record<string, number | string>[];
  dataKey: string;
  nameKey: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBars({
  data,
  xKey,
  barKey,
  color = '#2f6bff',
}: {
  data: Record<string, number | string>[];
  xKey: string;
  barKey: string;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" {...AXIS} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey={xKey} {...AXIS} tickLine={false} axisLine={false} width={70} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
        <Bar dataKey={barKey} fill={color} radius={[0, 5, 5, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DualLine({
  data,
  xKey,
  series,
}: {
  data: Record<string, number | string>[];
  xKey: string;
  series: { key: string; color: string; label: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} {...AXIS} tickLine={false} axisLine={false} />
        <YAxis {...AXIS} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2.4}
            dot={{ r: 3, fill: s.color }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
