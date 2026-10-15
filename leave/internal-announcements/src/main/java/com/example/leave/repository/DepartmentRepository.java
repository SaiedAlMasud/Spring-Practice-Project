package com.example.leave.repository;

import com.example.leave.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartmentRepository
    extends JpaRepository<Department, Long> {
    Optional<Department> findByNameIgnoreCase(String name);
}
