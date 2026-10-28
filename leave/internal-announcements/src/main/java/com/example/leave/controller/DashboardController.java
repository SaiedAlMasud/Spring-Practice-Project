package com.example.leave.controller;

import com.example.leave.dto.DashboardResponse;
import com.example.leave.dto.EmployeeDashboardResponse;
import com.example.leave.entity.Employee;
import com.example.leave.entity.Role;
import com.example.leave.repository.EmployeeRepository;
import com.example.leave.service.DashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final EmployeeRepository employeeRepository;

    public DashboardController(
            DashboardService dashboardService,
            EmployeeRepository employeeRepository
    ) {
        this.dashboardService = dashboardService;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping
    public DashboardResponse getDashboard(Authentication authentication) {

        Employee requester = employeeRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Employee not found"
                ));

        if (requester.getRole() != Role.HR) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only HR can view the dashboard"
            );
        }

        return dashboardService.getDashboardSummary();
    }

    @GetMapping("/employee")
    public EmployeeDashboardResponse getEmployeeDashboard(
            Authentication authentication
    ) {
        return dashboardService.getEmployeeDashboard(authentication.getName());
    }
}