
package com.example.leave.controller;

import com.example.leave.dto.AnnouncementRequest;
import com.example.leave.dto.AnnouncementResponse;
import com.example.leave.entity.Announcement;
import com.example.leave.entity.AnnouncementType;
import com.example.leave.service.AnnouncementService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AnnouncementResponse createAnnouncement(@Valid @RequestBody AnnouncementRequest request, Authentication authentication) {

        return announcementService.createAnnouncement(
                request,
                authentication.getName()
        );
    }


    @GetMapping
    public Page<AnnouncementResponse> getEmployeeFeed(
            Authentication authentication,
            @RequestParam(required = false) AnnouncementType type,
            @RequestParam(required = false) String search,
            @PageableDefault(
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {

        return announcementService.getEmployeeFeed(
                authentication.getName(),
                type,
                search,
                pageable
        );
    }

}
