package com.evalease.evalease_backend.controller;

import com.evalease.evalease_backend.dto.AuthResponse;
import com.evalease.evalease_backend.dto.LoginRequestDTO;
import com.evalease.evalease_backend.dto.SignUpRequestDTO;
import com.evalease.evalease_backend.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @RequestBody SignUpRequestDTO request
    ) {
        try {
            AuthResponse response = authService.signup(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequestDTO request
    ) {
        try {
            AuthResponse response = authService.login(request);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }
}