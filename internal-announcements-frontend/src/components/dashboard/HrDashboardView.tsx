import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Clock,
  Megaphone,
  Plus,
  Users,
} from "lucide-react";
import type { HrDashboard } from "../../types/dashboard";
import ActivityAreaChart from "./ActivityAreaChart";
import AnnouncementRow from "./AnnouncementRow";
import DonutChart, { type Slice } from "./DonutChart";
import EmptyState from "./EmptyState";
import Panel from "./Panel";
import PolicyProgressList from "./PolicyProgressList";
import QuickAction from "./QuickAction";
import SimpleBarChart, { type BarDatum } from "./SimpleBarChart";
import StatCard, { type Trend } from "./StatCard";
import ViewAllLink from "./ViewAllLink";
import { COLORS } from "./chartTheme";
import { formatDate, shortDay, shortMonth } from "./helpers";

export default function HrDashboardView({ data }: { data: HrDashboard }) {
  const months = data.monthlyActivity;
  const thisMonth = months[months.length - 1];
  const lastMonth = months[months.length - 2];

  const monthTrend: Trend | null =
    thisMonth && lastMonth && lastMonth.count > 0
      ? {
          percent: Math.round(
            ((thisMonth.count - lastMonth.count) / lastMonth.count) * 100,
          ),
          label: "vs last month",
        }
      : null;

  const activityData = data.dailyActivity.map((point) => ({
    label: shortDay(point.date),
    count: point.count,
  }));
  const activityTotal = data.dailyActivity.reduce(
    (sum, point) => sum + point.count,
    0,
  );

  const monthlyData: BarDatum[] = months.map((point) => ({
    label: shortMonth(point.month),
    value: point.count,
  }));
  const monthlyTotal = months.reduce((sum, point) => sum + point.count, 0);

  const statusSlices: Slice[] = [
    { name: "Active", value: data.activeAnnouncements, color: COLORS.green },
    { name: "Expired", value: data.expiredAnnouncements, color: COLORS.slate },
    { name: "Archived", value: data.archivedAnnouncements, color: COLORS.purple },
  ];

  const typeData: BarDatum[] = [
    { label: "General", value: data.generalAnnouncements, color: COLORS.blue },
    { label: "Policy", value: data.policyAnnouncements, color: COLORS.purple },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Announcements" value={data.totalAnnouncements} description="All announcements ever created" icon={Megaphone} tone="blue" />
        <StatCard label="Active" value={data.activeAnnouncements} description="Currently visible to employees" icon={CheckCircle2} tone="green" />
        <StatCard label="Expired" value={data.expiredAnnouncements} description="Past their expiry date" icon={Clock} tone="slate" />
        <StatCard label="Archived" value={data.archivedAnnouncements} description="Removed from the employee feed" icon={Archive} tone="purple" />
        <StatCard label="This Month" value={data.announcementsThisMonth} description="Created this calendar month" icon={CalendarDays} tone="blue" trend={monthTrend} />
        <StatCard label="Employees" value={data.totalEmployees} description="Registered employees" icon={Users} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Announcement Activity" subtitle={`${activityTotal} created in the last 30 days`} className="lg:col-span-2">
          <ActivityAreaChart
            data={activityData}
            emptyMessage="No announcements were created in the last 30 days."
          />
        </Panel>
        <Panel title="Status Distribution" subtitle="All announcements">
          <DonutChart slices={statusSlices} centerLabel="Total" />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Monthly Activity" subtitle="Created in the last 6 months">
          {monthlyTotal === 0 ? <EmptyState message="No activity in the last 6 months." className="h-56" /> : <SimpleBarChart data={monthlyData} />}
        </Panel>
        <Panel title="By Type" subtitle="General vs policy announcements">
          {data.totalAnnouncements === 0 ? <EmptyState message="No announcements yet." className="h-56" /> : <SimpleBarChart data={typeData} />}
        </Panel>
        <Panel title="Policy Acknowledgement" subtitle="Active policies, latest first">
          {data.policyProgress.length === 0 ? (
            <EmptyState message="No active policies need acknowledgement." className="h-56" />
          ) : (
            <PolicyProgressList policies={data.policyProgress} />
          )}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Recent Announcements" subtitle="Latest 5 created" action={<ViewAllLink />} className="lg:col-span-2">
          {data.recentAnnouncements.length === 0 ? (
            <EmptyState message="No announcements have been created yet." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentAnnouncements.map((item) => (
                <AnnouncementRow
                  key={item.id}
                  title={item.title}
                  preview={item.preview}
                  type={item.type}
                  status={item.status}
                  meta={`${item.targetDepartmentName ?? "All departments"} • ${item.createdByEmail} • ${formatDate(item.createdAt)}`}
                />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Quick Actions">
          <div className="space-y-3">
            <QuickAction to="/announcements/create" icon={Plus} title="Create Announcement" description="Publish a company update or policy" tone="green" />
            <QuickAction to="/announcements" icon={Megaphone} title="Manage Announcements" description="View, edit and archive" tone="blue" />
            <QuickAction to="/employees" icon={Users} title="Manage Employees" description="View employees and add new ones" tone="purple" />
          </div>
        </Panel>
      </div>
    </div>
  );
}
