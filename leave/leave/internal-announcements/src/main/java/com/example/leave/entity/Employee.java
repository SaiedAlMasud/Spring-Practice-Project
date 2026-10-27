package com.example.leave.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean active = true;

    @Column(name = "must_change_password", nullable = false,
            columnDefinition = "boolean default false")
    private boolean mustChangePassword = false;

    public Employee(){

    }
    public Employee(String name, String email, String password, Role role, Department department){
        this.name=name;
        this.email=email;
        this.password=password;
        this.role=role;
        this.department=department;

    }
}
