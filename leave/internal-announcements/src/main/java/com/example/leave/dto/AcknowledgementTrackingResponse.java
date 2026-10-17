
package com.example.leave.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AcknowledgementTrackingResponse {

    private Long announcementId;
    private String title;
    private long totalEmployees;
    private long acknowledgedCount;
    private long pendingCount;
    private double completionPercentage;

    public AcknowledgementTrackingResponse() {
    }

    public AcknowledgementTrackingResponse(
            Long announcementId,
            String title,
            long totalEmployees,
            long acknowledgedCount,
            long pendingCount,
            double completionPercentage) {
        this.announcementId = announcementId;
        this.title = title;
        this.totalEmployees = totalEmployees;
        this.acknowledgedCount = acknowledgedCount;
        this.pendingCount = pendingCount;
        this.completionPercentage = completionPercentage;
    }
}
