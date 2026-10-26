package com.example.leave.controller;

import com.example.leave.dto.CreateEmployeeRequest;
import com.example.leave.dto.EmployeeResponse;
import com.example.leave.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {
    private final EmployeeService employeeService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse createEmployee(
            @Valid @RequestBody CreateEmployeeRequest request,
            Authentication authentication
    ) {
        return employeeService.createEmployee(
                request,
                authentication.getName()
        );
    }

    @GetMapping
    public List<EmployeeResponse> getAllEmployees(
            Authentication authentication
    ) {
        return employeeService.getAllEmployees(authentication.getName());
    }
}
