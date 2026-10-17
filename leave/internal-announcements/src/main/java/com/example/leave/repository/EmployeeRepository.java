package com.example.leave.repository;

import com.example.leave.entity.Employee;
import com.example.leave.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository
    extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    long countByRole(Role role);

    long countByDepartment_IdAndRole(
            Long departmentId,
            Role role
    );
}
