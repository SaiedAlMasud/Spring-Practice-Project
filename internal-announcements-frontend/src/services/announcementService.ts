import api from "./api";
import type {
  Announcement,
  AnnouncementPage,
  AnnouncementType,
} from "../types/announcement";


export interface AcknowledgementTracking {
  announcementId: number;
  title: string;
  totalEmployees: number;
  acknowledgedCount: number;
  pendingCount: number;
  completionPercentage: number;
}

export const getAcknowledgementTracking = async (
  announcementId: number
): Promise<AcknowledgementTracking> => {
  const response = await api.get<AcknowledgementTracking>(
    `/announcements/${announcementId}/acknowledgement-tracking`
  );

  return response.data;
};


export interface AnnouncementRequest {
  title: string;
  body: string;
  type: AnnouncementType;
  targetDepartmentId: number | null;
  expiresAt: string;
}

export interface Department {
  id: number;
  name: string;
}

export const getAnnouncements = async (
  params?: Record<string, string | number>
): Promise<AnnouncementPage> => {
  const response = await api.get<AnnouncementPage>(
    "/announcements",
    { params }
  );

  return response.data;
};

export const getAnnouncement = async (
  id: number
): Promise<Announcement> => {
  const response = await api.get<Announcement>(
    `/announcements/${id}`
  );

  return response.data;
};

export const getManagedAnnouncements = async (
  params?: Record<string, string | number>
): Promise<AnnouncementPage> => {
  const response = await api.get<AnnouncementPage>(
    "/announcements/manage",
    { params }
  );

  return response.data;
};

export const acknowledgePolicy = async (id: number) => {
  const response = await api.post(
    `/announcements/${id}/acknowledge`
  );

  return response.data;
};

export const createAnnouncement = async (
  request: AnnouncementRequest
): Promise<Announcement> => {
  const response = await api.post<Announcement>(
    "/announcements",
    request
  );

  return response.data;
};
