package com.example.leave.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record DashboardResponse(
        long totalEmployees,
        long totalAnnouncements,
        long activeAnnouncements,
        long archivedAnnouncements,
        long expiredAnnouncements,
        long announcementsThisMonth,
        long generalAnnouncements,
        long policyAnnouncements,
        List<DailyPoint> dailyActivity,
        List<MonthlyPoint> monthlyActivity,
        List<RecentAnnouncement> recentAnnouncements,
        List<PolicyProgress> policyProgress
) {

    public record DailyPoint(String date, long count) {
    }

    public record MonthlyPoint(String month, long count) {
    }

    public record RecentAnnouncement(
            Long id,
            String title,
            String preview,
            String type,
            String status,
            String targetDepartmentName,
            String createdByEmail,
            OffsetDateTime createdAt,
            OffsetDateTime expiresAt
    ) {
    }

    public record PolicyProgress(
            Long announcementId,
            String title,
            long totalEmployees,
            long acknowledgedCount,
            double completionPercentage
    ) {
    }
}