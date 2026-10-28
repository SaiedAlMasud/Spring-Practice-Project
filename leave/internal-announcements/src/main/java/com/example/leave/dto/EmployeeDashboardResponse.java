package com.example.leave.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record EmployeeDashboardResponse(
        long totalActive,
        long generalCount,
        long policyCount,
        long policiesAcknowledged,
        long policiesPending,
        long newThisWeek,
        List<Item> recentAnnouncements,
        List<Item> pendingPolicies
) {

    public record Item(
            Long id,
            String title,
            String preview,
            String type,
            OffsetDateTime createdAt,
            OffsetDateTime expiresAt,
            boolean acknowledged
    ) {
    }
}