
package com.example.leave.service;

import com.example.leave.dto.AcknowledgementResponse;
import com.example.leave.dto.AcknowledgementTrackingResponse;
import com.example.leave.dto.AnnouncementRequest;
import com.example.leave.dto.AnnouncementResponse;
import com.example.leave.entity.*;
import com.example.leave.repository.AnnouncementReadRepository;
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
    private final AnnouncementReadRepository announcementReadRepository;

    public AnnouncementService(
            AnnouncementRepository announcementRepository,
            DepartmentRepository departmentRepository,
            EmployeeRepository employeeRepository,
            AnnouncementReadRepository announcementReadRepository
    ) {
        this.announcementRepository = announcementRepository;
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.announcementReadRepository = announcementReadRepository;
    }

    @Transactional
    public AnnouncementResponse archiveAnnouncement(
            Long id,
            String requesterEmail
    ) {
        Employee requester = employeeRepository
                .findByEmailIgnoreCase(requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Employee not found"
                ));

        if (requester.getRole() != Role.HR) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only HR can archive announcements"
            );
        }

        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Announcement not found"
                ));

        if (announcement.isArchived()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Announcement is already archived"
            );
        }

        announcement.setArchived(true);

        Announcement archived = announcementRepository.save(announcement);

        return toResponse(archived);
    }

    @Transactional
    public AnnouncementResponse updateAnnouncement(
            Long id,
            AnnouncementRequest request,
            String requesterEmail
    ) {
        Employee requester = employeeRepository
                .findByEmailIgnoreCase(requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Employee not found"
                ));

        if (requester.getRole() != Role.HR) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only HR can update announcements"
            );
        }

        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Announcement not found"
                ));

        if (announcement.isArchived()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Archived announcements cannot be updated"
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

        announcement.setTitle(request.getTitle());
        announcement.setBody(request.getBody());
        announcement.setType(request.getType());
        announcement.setTargetDepartment(targetDepartment);
        announcement.setExpiresAt(request.getExpiresAt());

        Announcement updated = announcementRepository.save(announcement);

        return toResponse(updated);
    }

    @Transactional(readOnly = true)
    public AnnouncementResponse getAnnouncementById(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Announcement not found"
                ));

        return toResponse(announcement);
    }

    @Transactional(readOnly = true)
    public AcknowledgementTrackingResponse getAcknowledgementTracking(
            Long announcementId,
            String requesterEmail
    ) {
        Employee requester = employeeRepository
                .findByEmailIgnoreCase(requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        if (requester.getRole() != Role.HR) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only HR can view acknowledgement tracking"
            );
        }

        Announcement announcement = announcementRepository
                .findById(announcementId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Announcement not found"
                ));

        if (announcement.getType() != AnnouncementType.POLICY) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tracking is available only for policy announcements"
            );
        }

        long totalEmployees;

        if (announcement.getTargetDepartment() == null) {
            totalEmployees = employeeRepository.countByRole(Role.EMPLOYEE);
        } else {
            totalEmployees = employeeRepository.countByDepartment_IdAndRole(
                    announcement.getTargetDepartment().getId(),
                    Role.EMPLOYEE
            );
        }

        long acknowledgedCount =
                announcementReadRepository
                        .countByAnnouncement_IdAndEmployee_Role(
                                announcementId,
                                Role.EMPLOYEE
                        );

        long pendingCount = totalEmployees - acknowledgedCount;

        double percentage = totalEmployees == 0
                ? 0.0
                : Math.round(
                acknowledgedCount * 10000.0 / totalEmployees
        ) / 100.0;

        return new AcknowledgementTrackingResponse(
                announcement.getId(),
                announcement.getTitle(),
                totalEmployees,
                acknowledgedCount,
                pendingCount,
                percentage
        );
    }

    @Transactional
    public AcknowledgementResponse acknowledgePolicy(
            Long announcementId,
            String employeeEmail
    ) {
        Employee employee = employeeRepository
                .findByEmailIgnoreCase(employeeEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        // Only employees can acknowledge policy announcements.
        if (employee.getRole() != Role.EMPLOYEE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only employees can acknowledge policies"
            );
        }

        Announcement announcement = announcementRepository
                .findById(announcementId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Announcement not found"
                ));

        if (announcement.getType() != AnnouncementType.POLICY) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only policy announcements can be acknowledged"
            );
        }

        if (announcement.isArchived()
                || !announcement.getExpiresAt().isAfter(OffsetDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This policy is no longer active"
            );
        }

        if (announcement.getTargetDepartment() != null
                && !announcement.getTargetDepartment().getId()
                .equals(employee.getDepartment().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This policy is not available to your department"
            );
        }

        boolean alreadyAcknowledged =
                announcementReadRepository
                        .existsByAnnouncement_IdAndEmployee_Id(
                                announcementId,
                                employee.getId()
                        );

        if (alreadyAcknowledged) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already acknowledged this policy"
            );
        }

        AnnouncementRead read = new AnnouncementRead(announcement, employee);
        AnnouncementRead saved = announcementReadRepository.save(read);

        return new AcknowledgementResponse(
                announcement.getId(),
                "Policy acknowledged successfully",
                saved.getReadAt()
        );
    }


    @Transactional(readOnly = true)
    public Page<AnnouncementResponse> getEmployeeFeed(
            String employeeEmail,
            AnnouncementType type,
            String search,
            Pageable pageable
    ) {
        Employee employee = employeeRepository
                .findByEmailIgnoreCase(employeeEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        String normalizedSearch = (search == null || search.isBlank())
                ? ""
                : search.trim().toLowerCase(Locale.ROOT);

        boolean filterByType = type != null;

        // Used only when a type filter is supplied.
        AnnouncementType effectiveType =
                filterByType ? type : AnnouncementType.GENERAL;

        Page<Announcement> announcements;

        if (employee.getRole() == Role.HR) {
            // HR can see active announcements from every department.
            announcements = announcementRepository.findAllVisibleAnnouncements(
                    OffsetDateTime.now(),
                    filterByType,
                    effectiveType,
                    normalizedSearch,
                    pageable
            );

            return announcements.map(this::toResponse);
        }

        // Employees can see ALL announcements and their own department's.
        announcements = announcementRepository.findVisibleAnnouncements(
                employee.getDepartment().getId(),
                OffsetDateTime.now(),
                filterByType,
                effectiveType,
                normalizedSearch,
                pageable
        );

        return announcements.map(
                announcement -> toResponse(announcement, employeeEmail)
        );
    }


    @Transactional
    public AnnouncementResponse createAnnouncement(
            AnnouncementRequest request,
            String creatorEmail
    ) {
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

    // General response mapping: acknowledgement defaults to false.
    private AnnouncementResponse toResponse(Announcement announcement) {
        AnnouncementResponse response = mapAnnouncementFields(announcement);
        response.setAcknowledged(false);
        return response;
    }

    // Employee feed mapping: calculate acknowledgement for this employee.
    private AnnouncementResponse toResponse(
            Announcement announcement,
            String employeeEmail
    ) {
        AnnouncementResponse response = mapAnnouncementFields(announcement);
        boolean acknowledged = false;

        if (announcement.getType() == AnnouncementType.POLICY) {
            Employee employee = employeeRepository
                    .findByEmailIgnoreCase(employeeEmail)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Employee not found"
                    ));

            acknowledged = announcementReadRepository
                    .existsByAnnouncement_IdAndEmployee_Id(
                            announcement.getId(),
                            employee.getId()
                    );
        }

        response.setAcknowledged(acknowledged);
        return response;
    }

    // Shared field mapping to avoid duplicate code.
    private AnnouncementResponse mapAnnouncementFields(
            Announcement announcement
    ) {
        AnnouncementResponse response = new AnnouncementResponse();

        response.setId(announcement.getId());
        response.setTitle(announcement.getTitle());
        response.setBody(announcement.getBody());
        response.setType(announcement.getType());

        if (announcement.getTargetDepartment() != null) {
            response.setTargetDepartmentId(
                    announcement.getTargetDepartment().getId()
            );
            response.setTargetDepartmentName(
                    announcement.getTargetDepartment().getName()
            );
        }

        response.setCreatedByEmail(announcement.getCreatedBy().getEmail());
        response.setExpiresAt(announcement.getExpiresAt());
        response.setArchived(announcement.isArchived());
        response.setCreatedAt(announcement.getCreatedAt());

        return response;
    }
}
