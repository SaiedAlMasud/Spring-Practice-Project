package com.example.leave.controller;

import com.example.leave.dto.DepartmentResponse;
import com.example.leave.repository.DepartmentRepository;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    public DepartmentController(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @GetMapping
    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAll(Sort.by("name"))
                .stream()
                .map(d -> new DepartmentResponse(d.getId(), d.getName()))
                .toList();
    }
}