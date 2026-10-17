
package com.example.leave.dto;

import com.example.leave.entity.AnnouncementType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
public class AnnouncementRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Body is required")
    private String body;

    @NotNull(message = "Announcement type is required")
    private AnnouncementType type;

    private Long targetDepartmentId;

    @NotNull(message = "Expiry date is required")
    @Future(message = "Expiry date must be in the future")
    private OffsetDateTime expiresAt;
}
