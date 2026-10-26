package com.example.leave.service;

import com.example.leave.dto.DashboardResponse;
import com.example.leave.entity.Role;
import com.example.leave.repository.AnnouncementRepository;
import com.example.leave.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final AnnouncementRepository announcementRepository;

    public DashboardService(
            EmployeeRepository employeeRepository,
            AnnouncementRepository announcementRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.announcementRepository = announcementRepository;
    }

    @Transactional
    public DashboardResponse getDashboardSummary() {

        long totalEmployees =
                employeeRepository.countByRole(Role.EMPLOYEE);

        long totalAnnouncements =
                announcementRepository.count();

        long activeAnnouncements =
                announcementRepository
                        .countByArchivedFalseAndExpiresAtAfter(
                                OffsetDateTime.now()
                        );

        long archivedAnnouncements =
                announcementRepository.countByArchivedTrue();

        return new DashboardResponse(
                totalEmployees,
                totalAnnouncements,
                activeAnnouncements,
                archivedAnnouncements
        );
    }
}