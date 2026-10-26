package com.example.leave.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DashboardResponse {

    private long totalEmployees;
    private long totalAnnouncements;
    private long activeAnnouncements;
    private long archivedAnnouncements;

    public DashboardResponse(
            long totalEmployees,
            long totalAnnouncements,
            long activeAnnouncements,
            long archivedAnnouncements
    ) {
        this.totalEmployees = totalEmployees;
        this.totalAnnouncements = totalAnnouncements;
        this.activeAnnouncements = activeAnnouncements;
        this.archivedAnnouncements = archivedAnnouncements;
    }
}