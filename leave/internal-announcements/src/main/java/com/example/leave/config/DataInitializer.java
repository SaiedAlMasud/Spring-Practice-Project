
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

    public DataInitializer(
            DepartmentRepository departmentRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Create departments if they do not exist
        Department hrDepartment =
                createDepartmentIfNotExists("Human Resources");

        Department engineeringDepartment =
                createDepartmentIfNotExists("Engineering");

        Department financeDepartment =
                createDepartmentIfNotExists("Finance");

        Department marketingDepartment =
                createDepartmentIfNotExists("Marketing");

        Department itDepartment =
                createDepartmentIfNotExists("Information Technology");

        Department operationsDepartment =
                createDepartmentIfNotExists("Operations");

        // Existing demo accounts
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

        // Additional HR account
        createEmployeeIfNotExists(
                "Test HR 2",
                "hr2@example.com",
                "Test@12345",
                Role.HR,
                hrDepartment
        );

        // Engineering employees
        createEmployeeIfNotExists(
                "Employee 2",
                "employee2@example.com",
                "Test@12345",
                Role.EMPLOYEE,
                engineeringDepartment
        );

        createEmployeeIfNotExists(
                "Employee 3",
                "employee3@example.com",
                "Test@12345",
                Role.EMPLOYEE,
                engineeringDepartment
        );

        // Human Resources employees
        createEmployeeIfNotExists(
                "Employee 4",
                "employee4@example.com",
                "Test@12345",
                Role.EMPLOYEE,
                hrDepartment
        );

        // Finance employees
        createEmployeeIfNotExists(
                "Employee 5",
                "employee5@example.com",
                "Test@12345",
                Role.EMPLOYEE,
                financeDepartment
        );

        createEmployeeIfNotExists(
                "Employee 6",
                "employee6@example.com",
                "Test@12345",
                Role.EMPLOYEE,
                financeDepartment
        );

        // Marketing employees
        createEmployeeIfNotExists(
                "Employee 7",
                "employee7@example.com",
                "Test@12345",
                Role.EMPLOYEE,
                marketingDepartment
        );

        createEmployeeIfNotExists(
                "Employee 8",
                "employee8@example.com",
                "Test@12345",
                Role.EMPLOYEE,
                marketingDepartment
        );

        // Information Technology employees
        createEmployeeIfNotExists(
                "Employee 9",
                "employee9@example.com",
                "Test@12345",
                Role.EMPLOYEE,
                itDepartment
        );

        createEmployeeIfNotExists(
                "Employee 10",
                "employee10@example.com",
                "Test@12345",
                Role.EMPLOYEE,
                itDepartment
        );

        // Operations employees
        createEmployeeIfNotExists(
                "Employee 11",
                "employee11@example.com",
                "Test@12345",
                Role.EMPLOYEE,
                operationsDepartment
        );

        createEmployeeIfNotExists(
                "Employee 12",
                "employee12@example.com",
                "Test@12345",
                Role.EMPLOYEE,
                operationsDepartment
        );

        System.out.println("Demo departments and users initialized successfully!");
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
            Department department
    ) {
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
