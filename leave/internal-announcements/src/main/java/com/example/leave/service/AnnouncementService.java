
package com.example.leave.service;

import com.example.leave.dto.AnnouncementRequest;
import com.example.leave.dto.AnnouncementResponse;
import com.example.leave.entity.*;
import com.example.leave.repository.AnnouncementRepository;
import com.example.leave.repository.DepartmentRepository;
import com.example.leave.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Locale;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public AnnouncementService(
            AnnouncementRepository announcementRepository,
            DepartmentRepository departmentRepository,
            EmployeeRepository employeeRepository) {
        this.announcementRepository = announcementRepository;
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional(readOnly = true)
    public Page<AnnouncementResponse> getEmployeeFeed(
            String employeeEmail,
            AnnouncementType type,
            String search,
            Pageable pageable) {

        Employee employee = employeeRepository
                .findByEmailIgnoreCase(employeeEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        String normalizedSearch = (search == null || search.isBlank())
                ? null
                : search.trim().toLowerCase(Locale.ROOT);

        return announcementRepository.findVisibleAnnouncements(
                employee.getDepartment().getId(),
                OffsetDateTime.now(),
                type,
                normalizedSearch,
                pageable
        ).map(this::toResponse);
    }

    public AnnouncementResponse createAnnouncement(
            AnnouncementRequest request,
            String creatorEmail) {

        Employee creator = employeeRepository
                .findByEmailIgnoreCase(creatorEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        if (creator.getRole() != Role.HR) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only HR can create announcements"
            );
        }

        Department targetDepartment = null;

        if (request.getTargetDepartmentId() != null) {
            targetDepartment = departmentRepository
                    .findById(request.getTargetDepartmentId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Target department not found"
                    ));
        }

        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setBody(request.getBody());
        announcement.setType(request.getType());
        announcement.setTargetDepartment(targetDepartment);
        announcement.setExpiresAt(request.getExpiresAt());
        announcement.setCreatedBy(creator);
        announcement.setArchived(false);

        Announcement saved = announcementRepository.save(announcement);

        return toResponse(saved);
    }

    private AnnouncementResponse toResponse(Announcement announcement){
        AnnouncementResponse response = new AnnouncementResponse();

        response.setId(announcement.getId());
        response.setTitle(announcement.getTitle());
        response.setBody(announcement.getBody());
        response.setType(announcement.getType());

        if (announcement.getTargetDepartment() != null) {
            response.setTargetDepartmentId(announcement.getTargetDepartment().getId());
            response.setTargetDepartmentName(announcement.getTargetDepartment().getName());
        }

        response.setCreatedByEmail(
                announcement.getCreatedBy().getEmail()
        );
        response.setExpiresAt(announcement.getExpiresAt());
        response.setArchived(announcement.isArchived());
        response.setCreatedAt(announcement.getCreatedAt());

        return response;

    }
}

