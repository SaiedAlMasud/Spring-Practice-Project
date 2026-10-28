import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toneClasses, type Tone } from "./tone";

interface QuickActionProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  tone: Tone;
}

export default function QuickAction({
  to,
  icon: Icon,
  title,
  description,
  tone,
}: QuickActionProps) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-blue-300 hover:bg-slate-50"
    >
      <div className={`rounded-lg p-2.5 ${toneClasses[tone]}`}>
        <Icon size={18} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-700">
          {title}
        </p>
        <p className="truncate text-xs text-slate-500">{description}</p>
      </div>
      <ArrowRight
        size={16}
        aria-hidden="true"
        className="shrink-0 text-slate-300 transition group-hover:text-blue-600"
      />
    </Link>
  );
}
