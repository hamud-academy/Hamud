"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BLUE = "#3b82f6";
const BLUE_LIGHT = "#93c5fd";
const GRAY = "#e2e8f0";
const GRAY_DARK = "var(--chart-axis)";

type RevenueMonth = { month: string; revenue: number };
type LevelSlice = { name: string; value: number; percent: number; color: string };
type EngagementBar = { range: string; count: number };
type ActivityDay = { day: string; count: number };

export function RevenueGrowthChart({ data }: { data: RevenueMonth[] }) {
  const chartData = MONTHS.map((m, i) => ({
    month: m,
    revenue: data[i]?.revenue ?? 0,
  }));
  return (
    <div className="h-[220px] sm:h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 8 }}>
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke={GRAY_DARK} />
          <YAxis tick={{ fontSize: 12 }} stroke={GRAY_DARK} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, "Revenue"]}
            contentStyle={{
              backgroundColor: "var(--chart-tooltip-bg)",
              border: "1px solid var(--chart-tooltip-border)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <Bar dataKey="revenue" fill={BLUE} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StudentDistributionChart({ total, levels }: { total: number; levels: LevelSlice[] }) {
  const data = levels.map((l) => ({ name: l.name, value: l.value, color: l.color }));
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-auto min-h-[220px] sm:h-[280px] py-4 min-w-0">
      <div className="relative h-40 w-40 sm:h-[200px] sm:w-[200px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{total.toLocaleString()}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Students</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2 w-full max-w-md sm:max-w-none">
        {levels.map((l) => (
          <li key={l.name} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
            {l.name} ({l.percent}%)
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EngagementFrequencyChart({ data }: { data: EngagementBar[] }) {
  return (
    <div className="h-[220px] sm:h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke={GRAY_DARK} />
          <YAxis tick={{ fontSize: 12 }} stroke={GRAY_DARK} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--chart-tooltip-bg)",
              border: "1px solid var(--chart-tooltip-border)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <Bar dataKey="count" fill={BLUE} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function UserActivityChart({ data }: { data: ActivityDay[] }) {
  const chartData = DAYS.map((d, i) => ({ day: d, count: data[i]?.count ?? 0 }));
  return (
    <div className="h-[220px] sm:h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 8 }}>
          <defs>
            <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BLUE} stopOpacity={0.4} />
              <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke={GRAY_DARK} />
          <YAxis tick={{ fontSize: 12 }} stroke={GRAY_DARK} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--chart-tooltip-bg)",
              border: "1px solid var(--chart-tooltip-border)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <Area type="monotone" dataKey="count" stroke={BLUE} strokeWidth={2} fill="url(#activityGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
