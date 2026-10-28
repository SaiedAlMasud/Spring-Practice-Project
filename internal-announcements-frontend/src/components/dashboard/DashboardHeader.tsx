import { CalendarDays, Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { displayName, getGreeting } from "./helpers";

interface DashboardHeaderProps {
  email?: string;
  isHR: boolean;
  loading: boolean;
  onRefresh: () => void;
}

export default function DashboardHeader({
  email,
  isHR,
  loading,
  onRefresh,
}: DashboardHeaderProps) {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          {isHR ? "HR Portal" : "Employee Portal"}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {getGreeting()}, {displayName(email)}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={16} aria-hidden="true" />
            {today}
          </span>
          <span aria-hidden="true">•</span>
          <span>Here is your office announcement overview.</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            aria-hidden="true"
            className={loading ? "animate-spin" : ""}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>

        {isHR && (
          <Link
            to="/announcements/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={16} aria-hidden="true" />
            Create Announcement
          </Link>
        )}
      </div>
    </header>
  );
}
