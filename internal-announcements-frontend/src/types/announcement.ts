export type AnnouncementType = "GENERAL" | "POLICY";

export interface Announcement {
  id: number;
  title: string;
  body: string;
  type: AnnouncementType;
  targetDepartmentId: number | null;
  targetDepartmentName: string | null;
  createdByEmail: string;
  expiresAt: string;
  archived: boolean;
  createdAt: string;
  acknowledged: boolean;
}

export interface AnnouncementPage {
  content: Announcement[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
