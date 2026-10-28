package com.example.leave.service;

import com.example.leave.dto.ChangePasswordRequest;
import com.example.leave.dto.LoginRequest;
import com.example.leave.dto.LoginResponse;
import com.example.leave.entity.Employee;
import com.example.leave.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
    public LoginResponse login(LoginRequest request) {

        Employee employee = employeeRepository
                .findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                employee.getPassword()
        );

        if (!passwordMatches) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        if (!employee.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is deactivated. Please contact HR."
            );
        }

        String token = jwtService.generateToken(employee.getEmail());

        return new LoginResponse(
                token,
                employee.getEmail(),
                employee.getRole().name(),
                employee.isMustChangePassword()
        );
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        Employee employee = employeeRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Employee not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), employee.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        if (passwordEncoder.matches(request.getNewPassword(), employee.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "New password must be different from the current one");
        }

        employee.setPassword(passwordEncoder.encode(request.getNewPassword()));
        employee.setMustChangePassword(false);
    }

}
