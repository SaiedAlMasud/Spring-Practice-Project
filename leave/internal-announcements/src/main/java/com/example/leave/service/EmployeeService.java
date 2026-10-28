package com.example.leave.service;

import com.example.leave.dto.CreateEmployeeRequest;
import com.example.leave.dto.EmployeeResponse;
import com.example.leave.dto.ResetPasswordRequest;
import com.example.leave.entity.Department;
import com.example.leave.entity.Employee;
import com.example.leave.entity.Role;
import com.example.leave.repository.DepartmentRepository;
import com.example.leave.repository.EmployeeRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public EmployeeResponse createEmployee(
            CreateEmployeeRequest request,
            String requesterEmail
    ) {
        requireHr(requesterEmail);

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String name = request.getName().trim();

        if (employeeRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An employee with this email already exists"
            );
        }

        if (employeeRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An employee with this name already exists"
            );
        }

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Department not found"
                ));

        Employee employee = new Employee();
        employee.setName(name);
        employee.setEmail(email);
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setRole(Role.EMPLOYEE);
        employee.setDepartment(department);

        employee.setMustChangePassword(true);
        Employee saved = employeeRepository.save(employee);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees(String requesterEmail) {
        requireHr(requesterEmail);

        return employeeRepository.findAll(Sort.by("name"))
                .stream()
                .map(this::toResponse)
                .toList();
    }


    @Transactional
    public void setActive(Long id, boolean active, String currentEmail) {
        requireHr(currentEmail);

        Employee target = employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        if (target.getEmail().equalsIgnoreCase(currentEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot change your own account status"
            );
        }

        if (!active && target.getRole() == Role.HR) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "HR accounts cannot be deactivated here"
            );
        }

        target.setActive(active);
    }
    @Transactional
    public void resetPassword(
            Long id,
            ResetPasswordRequest request,
            String requesterEmail
    ) {
        requireHr(requesterEmail);

        Employee target = employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        if (target.getRole() == Role.HR) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "HR accounts must use the Change Password option"
            );
        }

        target.setPassword(passwordEncoder.encode(request.getNewPassword()));
        target.setMustChangePassword(true);
    }


    private void requireHr(String requesterEmail) {
        Employee requester = employeeRepository
                .findByEmailIgnoreCase(requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Employee not found"
                ));

        if (requester.getRole() != Role.HR) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only HR can manage employees"
            );
        }
    }

    private EmployeeResponse toResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getRole().name(),
                employee.getDepartment().getId(),
                employee.getDepartment().getName(),
                employee.isActive()
        );
    }
}
