package com.example.leave.controller;

import com.example.leave.dto.LoginRequest;
import com.example.leave.dto.LoginResponse;
import com.example.leave.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping
    public LoginResponse login (@Valid @RequestBody LoginRequest request){
        return authService.login(request);
    }
}
