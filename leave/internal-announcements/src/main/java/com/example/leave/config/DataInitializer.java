package com.example.leave.config;

import com.example.leave.entity.Department;
import com.example.leave.entity.Employee;
import com.example.leave.entity.Role;
import com.example.leave.repository.DepartmentRepository;
import com.example.leave.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(DepartmentRepository departmentRepository, EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder){
        this.departmentRepository=departmentRepository;
        this.employeeRepository=employeeRepository;
        this.passwordEncoder=passwordEncoder;
    }

    @Override
    public void run(String... args) {
        Department hrDepartment = createDepartmentIfNotExists("Human Resources");

        Department engineeringDepartment = createDepartmentIfNotExists("Engineering");

        createEmployeeIfNotExists(
                "Demo HR",
                "hr@example.com",
                "Hr@12345",
                Role.HR,
                hrDepartment
        );

        createEmployeeIfNotExists(
                "Demo Employee",
                "employee@example.com",
                "Emp@12345",
                Role.EMPLOYEE,
                engineeringDepartment
        );

        System.out.println("Demo data initialized successfully!");
    }

    private Department createDepartmentIfNotExists(String name) {
        return departmentRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> {
                    Department department = new Department();
                    department.setName(name);
                    return departmentRepository.save(department);
                });
    }

    private void createEmployeeIfNotExists(
            String name,
            String email,
            String rawPassword,
            Role role,
            Department department) {

        if (employeeRepository.existsByEmailIgnoreCase(email)) {
            return;
        }

        Employee employee = new Employee();
        employee.setName(name);
        employee.setEmail(email);
        employee.setPassword(passwordEncoder.encode(rawPassword));
        employee.setRole(role);
        employee.setDepartment(department);

        employeeRepository.save(employee);
    }
}
