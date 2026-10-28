import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { axisTick, COLORS, tooltipStyle } from "./chartTheme";

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export default function SimpleBarChart({ data }: { data: BarDatum[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
          />
          <YAxis
            allowDecimals={false}
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f1f5f9" }} />
          <Bar
            dataKey="value"
            name="Announcements"
            radius={[4, 4, 0, 0]}
            maxBarSize={44}
          >
            {data.map((item) => (
              <Cell key={item.label} fill={item.color ?? COLORS.blue} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
