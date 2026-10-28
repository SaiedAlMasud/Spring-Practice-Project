export type AnnouncementKind = "GENERAL" | "POLICY";
export type AnnouncementStatus = "ACTIVE" | "EXPIRED" | "ARCHIVED";

/* ---------- HR dashboard ---------- */

export interface DailyPoint {
  date: string; // yyyy-MM-dd
  count: number;
}

export interface MonthlyPoint {
  month: string; // yyyy-MM
  count: number;
}

export interface RecentAnnouncement {
  id: number;
  title: string;
  preview: string;
  type: AnnouncementKind;
  status: AnnouncementStatus;
  targetDepartmentName: string | null;
  createdByEmail: string;
  createdAt: string;
  expiresAt: string;
}

export interface PolicyProgress {
  announcementId: number;
  title: string;
  totalEmployees: number;
  acknowledgedCount: number;
  completionPercentage: number;
}

export interface HrDashboard {
  totalEmployees: number;
  totalAnnouncements: number;
  activeAnnouncements: number;
  archivedAnnouncements: number;
  expiredAnnouncements: number;
  announcementsThisMonth: number;
  generalAnnouncements: number;
  policyAnnouncements: number;
  dailyActivity: DailyPoint[];
  monthlyActivity: MonthlyPoint[];
  recentAnnouncements: RecentAnnouncement[];
  policyProgress: PolicyProgress[];
}

/* ---------- Employee dashboard ---------- */

export interface EmployeeAnnouncementItem {
  id: number;
  title: string;
  preview: string;
  type: AnnouncementKind;
  createdAt: string;
  expiresAt: string;
  acknowledged: boolean;
}

export interface EmployeeDashboard {
  totalActive: number;
  generalCount: number;
  policyCount: number;
  policiesAcknowledged: number;
  policiesPending: number;
  newThisWeek: number;
  recentAnnouncements: EmployeeAnnouncementItem[];
  pendingPolicies: EmployeeAnnouncementItem[];
}