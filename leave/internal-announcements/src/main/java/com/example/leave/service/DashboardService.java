package com.example.leave.service;

import com.example.leave.dto.DashboardResponse;
import com.example.leave.dto.EmployeeDashboardResponse;
import com.example.leave.entity.Announcement;
import com.example.leave.entity.AnnouncementType;
import com.example.leave.entity.Employee;
import com.example.leave.entity.Role;
import com.example.leave.repository.AnnouncementReadRepository;
import com.example.leave.repository.AnnouncementRepository;
import com.example.leave.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class DashboardService {

    // Charts group announcements by calendar day/month in this time zone.
    private static final ZoneId ZONE = ZoneId.of("Asia/Dhaka");
    private static final int PREVIEW_LENGTH = 140;
    private static final int LIST_LIMIT = 5;

    private final EmployeeRepository employeeRepository;
    private final AnnouncementRepository announcementRepository;
    private final AnnouncementReadRepository announcementReadRepository;

    public DashboardService(
            EmployeeRepository employeeRepository,
            AnnouncementRepository announcementRepository,
            AnnouncementReadRepository announcementReadRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.announcementRepository = announcementRepository;
        this.announcementReadRepository = announcementReadRepository;
    }

    /* ------------------------------------------------------------------ */
    /*  HR dashboard                                                      */
    /* ------------------------------------------------------------------ */

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardSummary() {
        OffsetDateTime now = OffsetDateTime.now();
        LocalDate today = LocalDate.now(ZONE);
        YearMonth currentMonth = YearMonth.from(today);

        // One query: creation times for the last 6 months (covers 30 days too).
        OffsetDateTime since = currentMonth
                .minusMonths(5)
                .atDay(1)
                .atStartOfDay(ZONE)
                .toOffsetDateTime();

        Map<LocalDate, Long> perDay = new HashMap<>();
        Map<YearMonth, Long> perMonth = new HashMap<>();

        for (OffsetDateTime createdAt
                : announcementRepository.findCreatedAtSince(since)) {
            LocalDate day = createdAt.atZoneSameInstant(ZONE).toLocalDate();
            perDay.merge(day, 1L, Long::sum);
            perMonth.merge(YearMonth.from(day), 1L, Long::sum);
        }

        List<DashboardResponse.DailyPoint> dailyActivity = new ArrayList<>();
        for (int i = 29; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            dailyActivity.add(new DashboardResponse.DailyPoint(
                    day.toString(),
                    perDay.getOrDefault(day, 0L)
            ));
        }

        List<DashboardResponse.MonthlyPoint> monthlyActivity = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth month = currentMonth.minusMonths(i);
            monthlyActivity.add(new DashboardResponse.MonthlyPoint(
                    month.toString(),
                    perMonth.getOrDefault(month, 0L)
            ));
        }

        List<DashboardResponse.RecentAnnouncement> recent =
                announcementRepository.findTop5ByOrderByCreatedAtDesc()
                        .stream()
                        .map(announcement -> toRecent(announcement, now))
                        .toList();

        List<DashboardResponse.PolicyProgress> policyProgress =
                announcementRepository
                        .findTop5ByTypeAndArchivedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                                AnnouncementType.POLICY,
                                now
                        )
                        .stream()
                        .map(this::toPolicyProgress)
                        .toList();

        return new DashboardResponse(
                employeeRepository.countByRole(Role.EMPLOYEE),
                announcementRepository.count(),
                announcementRepository.countByArchivedFalseAndExpiresAtAfter(now),
                announcementRepository.countByArchivedTrue(),
                announcementRepository
                        .countByArchivedFalseAndExpiresAtLessThanEqual(now),
                perMonth.getOrDefault(currentMonth, 0L),
                announcementRepository.countByType(AnnouncementType.GENERAL),
                announcementRepository.countByType(AnnouncementType.POLICY),
                dailyActivity,
                monthlyActivity,
                recent,
                policyProgress
        );
    }

    private DashboardResponse.RecentAnnouncement toRecent(
            Announcement announcement,
            OffsetDateTime now
    ) {
        String status;
        if (announcement.isArchived()) {
            status = "ARCHIVED";
        } else if (!announcement.getExpiresAt().isAfter(now)) {
            status = "EXPIRED";
        } else {
            status = "ACTIVE";
        }

        return new DashboardResponse.RecentAnnouncement(
                announcement.getId(),
                announcement.getTitle(),
                preview(announcement.getBody()),
                announcement.getType().name(),
                status,
                announcement.getTargetDepartment() == null
                        ? null
                        : announcement.getTargetDepartment().getName(),
                announcement.getCreatedBy().getEmail(),
                announcement.getCreatedAt(),
                announcement.getExpiresAt()
        );
    }

    private DashboardResponse.PolicyProgress toPolicyProgress(
            Announcement announcement
    ) {
        long totalEmployees;

        if (announcement.getTargetDepartment() == null) {
            totalEmployees = employeeRepository.countByRole(Role.EMPLOYEE);
        } else {
            totalEmployees = employeeRepository.countByDepartment_IdAndRole(
                    announcement.getTargetDepartment().getId(),
                    Role.EMPLOYEE
            );
        }

        long acknowledged = announcementReadRepository
                .countByAnnouncement_IdAndEmployee_Role(
                        announcement.getId(),
                        Role.EMPLOYEE
                );

        double percentage = totalEmployees == 0
                ? 0.0
                : Math.round(acknowledged * 1000.0 / totalEmployees) / 10.0;

        return new DashboardResponse.PolicyProgress(
                announcement.getId(),
                announcement.getTitle(),
                totalEmployees,
                acknowledged,
                percentage
        );
    }

    /* ------------------------------------------------------------------ */
    /*  Employee dashboard                                                */
    /* ------------------------------------------------------------------ */

    @Transactional(readOnly = true)
    public EmployeeDashboardResponse getEmployeeDashboard(String email) {
        Employee employee = employeeRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime weekAgo = now.minusDays(7);

        // Active announcements this employee is allowed to see (newest first).
        List<Announcement> visible = announcementRepository
                .findActiveVisibleForDepartment(
                        employee.getDepartment().getId(),
                        now
                );

        Set<Long> acknowledgedIds = new HashSet<>(
                announcementReadRepository
                        .findAcknowledgedAnnouncementIds(employee.getId())
        );

        long policyCount = visible.stream()
                .filter(a -> a.getType() == AnnouncementType.POLICY)
                .count();

        long policiesAcknowledged = visible.stream()
                .filter(a -> a.getType() == AnnouncementType.POLICY
                        && acknowledgedIds.contains(a.getId()))
                .count();

        long newThisWeek = visible.stream()
                .filter(a -> a.getCreatedAt().isAfter(weekAgo))
                .count();

        List<EmployeeDashboardResponse.Item> recent = visible.stream()
                .limit(LIST_LIMIT)
                .map(a -> toItem(a, acknowledgedIds))
                .toList();

        List<EmployeeDashboardResponse.Item> pending = visible.stream()
                .filter(a -> a.getType() == AnnouncementType.POLICY
                        && !acknowledgedIds.contains(a.getId()))
                .limit(LIST_LIMIT)
                .map(a -> toItem(a, acknowledgedIds))
                .toList();

        return new EmployeeDashboardResponse(
                visible.size(),
                visible.size() - policyCount,
                policyCount,
                policiesAcknowledged,
                policyCount - policiesAcknowledged,
                newThisWeek,
                recent,
                pending
        );
    }

    private EmployeeDashboardResponse.Item toItem(
            Announcement announcement,
            Set<Long> acknowledgedIds
    ) {
        return new EmployeeDashboardResponse.Item(
                announcement.getId(),
                announcement.getTitle(),
                preview(announcement.getBody()),
                announcement.getType().name(),
                announcement.getCreatedAt(),
                announcement.getExpiresAt(),
                acknowledgedIds.contains(announcement.getId())
        );
    }

    /* ------------------------------------------------------------------ */

    private String preview(String body) {
        if (body == null) {
            return "";
        }
        String text = body.replaceAll("\\s+", " ").trim();
        return text.length() <= PREVIEW_LENGTH
                ? text
                : text.substring(0, PREVIEW_LENGTH).trim() + "…";
    }
}