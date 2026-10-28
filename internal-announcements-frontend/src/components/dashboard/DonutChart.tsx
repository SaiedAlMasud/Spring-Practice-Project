import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import EmptyState from "./EmptyState";
import { tooltipStyle } from "./chartTheme";

export interface Slice {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: Slice[];
  centerLabel: string;
}

export default function DonutChart({ slices, centerLabel }: DonutChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  if (total === 0) {
    return <EmptyState message="No data to display yet." className="h-56" />;
  }

  const visibleSlices = slices.filter((slice) => slice.value > 0);

  return (
    <div>
      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visibleSlices}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="none"
            >
              {visibleSlices.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">{centerLabel}</span>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {slices.map((slice) => (
          <li
            key={slice.name}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              {slice.name}
            </span>
            <span className="font-semibold text-slate-900">
              {slice.value}{" "}
              <span className="font-normal text-slate-400">
                ({Math.round((slice.value / total) * 100)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
