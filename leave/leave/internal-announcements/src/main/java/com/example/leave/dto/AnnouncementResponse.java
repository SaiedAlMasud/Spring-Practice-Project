package com.example.leave.dto;

import com.example.leave.entity.AnnouncementType;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
public class AnnouncementResponse {

    private Long id;
    private String title;
    private String body;
    private AnnouncementType type;
    private Long targetDepartmentId;
    private String targetDepartmentName;
    private String createdByEmail;
    private OffsetDateTime expiresAt;
    private boolean archived;
    private boolean acknowledged;
    private OffsetDateTime createdAt;
}
