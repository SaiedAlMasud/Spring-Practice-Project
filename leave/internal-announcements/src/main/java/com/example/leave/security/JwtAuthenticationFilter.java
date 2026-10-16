package com.example.leave.security;

import com.example.leave.entity.Employee;
import com.example.leave.repository.EmployeeRepository;
import com.example.leave.service.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final EmployeeRepository employeeRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            EmployeeRepository employeeRepository) {
        this.jwtService = jwtService;
        this.employeeRepository = employeeRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                String email = jwtService.extractEmail(token);

                if (SecurityContextHolder.getContext()
                        .getAuthentication() == null
                        && jwtService.isTokenValid(token, email)) {

                    Employee employee = employeeRepository
                            .findByEmailIgnoreCase(email)
                            .orElse(null);

                    if (employee != null) {
                        var authorities = List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_" + employee.getRole().name()
                                )
                        );

                        var authentication =
                                new UsernamePasswordAuthenticationToken(
                                        employee.getEmail(),
                                        null,
                                        authorities
                                );

                        SecurityContextHolder.getContext()
                                .setAuthentication(authentication);
                    }
                }

            } catch (JwtException | IllegalArgumentException exception) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

}
