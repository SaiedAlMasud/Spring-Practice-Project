import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { axisTick, COLORS, tooltipStyle } from "./chartTheme";
import EmptyState from "./EmptyState";

export interface ActivityPoint {
  label: string;
  count: number;
}

interface ActivityAreaChartProps {
  data: ActivityPoint[];
  emptyMessage?: string;
}

export default function ActivityAreaChart({
  data,
  emptyMessage = "No activity to display yet.",
}: ActivityAreaChartProps) {
  const total = data.reduce((sum, point) => sum + point.count, 0);

  if (total === 0) {
    return <EmptyState message={emptyMessage} className="h-60" />;
  }

  return (
    <div className="h-60">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="dashboardTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.2} />
              <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={COLORS.grid}
          />
          <XAxis
            dataKey="label"
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            allowDecimals={false}
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="count"
            name="Announcements"
            stroke={COLORS.blue}
            strokeWidth={2}
            fill="url(#dashboardTrendFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
