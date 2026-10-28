import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toneClasses, type Tone } from "./tone";

export interface Trend {
  percent: number;
  label: string;
}

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone: Tone;
  trend?: Trend | null;
}

export default function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
  trend,
}: StatCardProps) {
  const TrendIcon =
    trend && trend.percent > 0
      ? TrendingUp
      : trend && trend.percent < 0
        ? TrendingDown
        : Minus;

  const trendColor =
    trend && trend.percent > 0
      ? "text-green-600"
      : trend && trend.percent < 0
        ? "text-red-600"
        : "text-slate-500";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${toneClasses[tone]}`}>
          <Icon size={20} aria-hidden="true" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${trendColor}`}
          >
            <TrendIcon size={14} aria-hidden="true" />
            {Math.abs(trend.percent)}%
          </span>
        )}
        <span className="text-xs text-slate-500">
          {trend ? trend.label : description}
        </span>
      </div>
    </article>
  );
}
