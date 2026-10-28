import { AcknowledgementBadge, StatusBadge, TypeBadge } from "./Badges";
import type { AnnouncementKind, AnnouncementStatus } from "../../types/dashboard";

interface AnnouncementRowProps {
  title: string;
  preview: string;
  type: AnnouncementKind;
  status?: AnnouncementStatus;
  acknowledged?: boolean;
  meta: string;
}

export default function AnnouncementRow({
  title,
  preview,
  type,
  status,
  acknowledged,
  meta,
}: AnnouncementRowProps) {
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="min-w-0 max-w-full truncate text-sm font-semibold text-slate-900">
          {title}
        </h3>
        <TypeBadge type={type} />
        {status && <StatusBadge status={status} />}
        {type === "POLICY" && acknowledged !== undefined && (
          <AcknowledgementBadge acknowledged={acknowledged} />
        )}
      </div>
      {preview && (
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
          {preview}
        </p>
      )}
      <p className="mt-1.5 text-xs text-slate-400">{meta}</p>
    </li>
  );
}
