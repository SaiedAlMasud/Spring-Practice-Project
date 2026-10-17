
package com.example.leave.service;

import com.example.leave.dto.AnnouncementRequest;
import com.example.leave.entity.Announcement;
import com.example.leave.entity.Department;
import com.example.leave.entity.Employee;
import com.example.leave.repository.AnnouncementRepository;
import com.example.leave.repository.DepartmentRepository;
import com.example.leave.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    public Announcement createAnnouncement(
            AnnouncementRequest request,
            String creatorEmail) {

        Employee creator = employeeRepository
                .findByEmailIgnoreCase(creatorEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        if (creator.getRole() != com.example.leave.entity.Role.HR) {
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

        return announcementRepository.save(announcement);
    }
}

