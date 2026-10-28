import type { HrDashboard } from "../../types/dashboard";

export default function PolicyProgressList({
  policies,
}: {
  policies: HrDashboard["policyProgress"];
}) {
  return (
    <ul className="space-y-4">
      {policies.map((policy) => {
        const percentage = Math.min(
          100,
          Math.max(0, Math.round(policy.completionPercentage)),
        );

        return (
          <li key={policy.announcementId}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium text-slate-800">
                {policy.title}
              </span>
              <span className="shrink-0 font-semibold text-slate-900">
                {percentage}%
              </span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${policy.title} acknowledgement progress`}
            >
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {policy.acknowledgedCount} of {policy.totalEmployees} employees
              acknowledged
            </p>
          </li>
        );
      })}
    </ul>
  );
}
