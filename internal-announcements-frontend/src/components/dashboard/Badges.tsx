import { CheckCircle2, Clock } from "lucide-react";
import type { AnnouncementKind, AnnouncementStatus } from "../../types/dashboard";

const statusClasses: Record<AnnouncementStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  EXPIRED: "bg-slate-100 text-slate-600",
  ARCHIVED: "bg-purple-100 text-purple-700",
};

export function TypeBadge({ type }: { type: AnnouncementKind }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        type === "POLICY"
          ? "bg-purple-100 text-purple-700"
          : "bg-blue-100 text-blue-700"
      }`}
    >
      {type === "POLICY" ? "Policy" : "General"}
    </span>
  );
}

export function StatusBadge({ status }: { status: AnnouncementStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClasses[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function AcknowledgementBadge({
  acknowledged,
}: {
  acknowledged: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        acknowledged
          ? "bg-green-100 text-green-700"
          : "bg-purple-100 text-purple-700"
      }`}
    >
      {acknowledged ? (
        <CheckCircle2 size={11} aria-hidden="true" />
      ) : (
        <Clock size={11} aria-hidden="true" />
      )}
      {acknowledged ? "Acknowledged" : "Action needed"}
    </span>
  );
}
