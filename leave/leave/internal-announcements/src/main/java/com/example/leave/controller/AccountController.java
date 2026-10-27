package com.example.leave.controller;

import com.example.leave.dto.ChangePasswordRequest;
import com.example.leave.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/account")
public class AccountController {
    private final AuthService authService;

    public AccountController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/change-password")
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request,
                               Principal principal) {
        authService.changePassword(principal.getName(), request);
    }
}