package com.example.leave.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
public class AcknowledgementResponse {
    private Long announcementId;
    private String message;
    private OffsetDateTime readAt;

    public AcknowledgementResponse(Long announcementId,
                                   String message,
                                   OffsetDateTime readAt){
        this.announcementId=announcementId;
        this.message=message;
        this.readAt=readAt;
    }
}
