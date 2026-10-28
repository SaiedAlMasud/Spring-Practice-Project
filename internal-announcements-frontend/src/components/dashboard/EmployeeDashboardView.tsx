import {
  BellRing,
  CheckCircle2,
  ClipboardCheck,
  KeyRound,
  Megaphone,
} from "lucide-react";
import type { EmployeeDashboard } from "../../types/dashboard";
import AnnouncementRow from "./AnnouncementRow";
import DonutChart, { type Slice } from "./DonutChart";
import EmptyState from "./EmptyState";
import Panel from "./Panel";
import QuickAction from "./QuickAction";
import SimpleBarChart, { type BarDatum } from "./SimpleBarChart";
import StatCard from "./StatCard";
import ViewAllLink from "./ViewAllLink";
import { COLORS } from "./chartTheme";
import { formatDate } from "./helpers";

export default function EmployeeDashboardView({
  data,
}: {
  data: EmployeeDashboard;
}) {
  const acknowledgementSlices: Slice[] = [
    { name: "Acknowledged", value: data.policiesAcknowledged, color: COLORS.green },
    { name: "Pending", value: data.policiesPending, color: COLORS.slate },
  ];

  const typeData: BarDatum[] = [
    { label: "General", value: data.generalCount, color: COLORS.blue },
    { label: "Policy", value: data.policyCount, color: COLORS.purple },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Announcements" value={data.totalActive} description="Visible to you right now" icon={Megaphone} tone="blue" />
        <StatCard label="New This Week" value={data.newThisWeek} description="Posted in the last 7 days" icon={BellRing} tone="purple" />
        <StatCard label="Policies Pending" value={data.policiesPending} description="Waiting for your acknowledgement" icon={ClipboardCheck} tone="slate" />
        <StatCard label="Policies Acknowledged" value={data.policiesAcknowledged} description="Policies you have confirmed" icon={CheckCircle2} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="My Policy Progress" subtitle="Active policies for you">
          {data.policyCount === 0 ? (
            <EmptyState message="There are no active policies for you right now." className="h-56" />
          ) : (
            <DonutChart slices={acknowledgementSlices} centerLabel="Policies" />
          )}
        </Panel>

        <Panel title="Needs Your Attention" subtitle="Policies waiting for your acknowledgement" action={<ViewAllLink />} className="lg:col-span-2">
          {data.pendingPolicies.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-green-200 bg-green-50 px-4 text-center">
              <CheckCircle2 size={28} aria-hidden="true" className="text-green-600" />
              <p className="mt-2 text-sm font-semibold text-green-800">You are all caught up</p>
              <p className="mt-1 text-xs text-green-700">No policies are waiting for your acknowledgement.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.pendingPolicies.map((item) => (
                <AnnouncementRow
                  key={item.id}
                  title={item.title}
                  preview={item.preview}
                  type={item.type}
                  acknowledged={item.acknowledged}
                  meta={`Expires ${formatDate(item.expiresAt)}`}
                />
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Recent Announcements" subtitle="Latest 5 for you" action={<ViewAllLink />} className="lg:col-span-2">
          {data.recentAnnouncements.length === 0 ? (
            <EmptyState message="There are no announcements for you yet." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentAnnouncements.map((item) => (
                <AnnouncementRow
                  key={item.id}
                  title={item.title}
                  preview={item.preview}
                  type={item.type}
                  acknowledged={item.type === "POLICY" ? item.acknowledged : undefined}
                  meta={`Posted ${formatDate(item.createdAt)} • Expires ${formatDate(item.expiresAt)}`}
                />
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="By Type" subtitle="Your active announcements">
            {data.totalActive === 0 ? (
              <EmptyState message="No active announcements." className="h-56" />
            ) : (
              <SimpleBarChart data={typeData} />
            )}
          </Panel>
          <Panel title="Quick Actions">
            <div className="space-y-3">
              <QuickAction to="/announcements" icon={Megaphone} title="View Announcements" description="Read updates and policies" tone="blue" />
              <QuickAction to="/change-password" icon={KeyRound} title="Change Password" description="Keep your account secure" tone="purple" />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
