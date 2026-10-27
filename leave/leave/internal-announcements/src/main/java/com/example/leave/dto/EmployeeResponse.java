package com.example.leave.dto;

public record EmployeeResponse (
        Long id,
        String name,
        String email,
        String role,
        Long departmentId,
        String departmentName,
        boolean active
){

}
