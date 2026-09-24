package com.evalease.evalease_backend.service;

import com.evalease.evalease_backend.dto.AuthResponse;
import com.evalease.evalease_backend.dto.LoginRequestDTO;
import com.evalease.evalease_backend.dto.SignUpRequestDTO;
import com.evalease.evalease_backend.entity.Employee;
import com.evalease.evalease_backend.entity.Role;
import com.evalease.evalease_backend.repository.EmployeeRepository;
import com.evalease.evalease_backend.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // =========================
    // SIGNUP
    // =========================
    public AuthResponse signup(SignUpRequestDTO request) {

        // Check whether email already exists
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists. Please login.");
        }

        // Create employee
        Employee employee = Employee.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.EMPLOYEE)
                .build();

        Employee savedEmployee = employeeRepository.save(employee);

        // Generate JWT
        String token = jwtService.generateToken(
                savedEmployee.getEmail(),
                savedEmployee.getRole().name()
        );

        return new AuthResponse(
                token,
                savedEmployee.getId(),
                savedEmployee.getName(),
                savedEmployee.getEmail(),
                savedEmployee.getRole().name()
        );
    }

    // =========================
    // LOGIN
    // =========================
    public AuthResponse login(LoginRequestDTO request) {

        Employee employee = employeeRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password")
                );

        // Check password
        if (!passwordEncoder.matches(
                request.getPassword(),
                employee.getPassword()
        )) {
            throw new RuntimeException("Invalid email or password");
        }

        // Generate JWT
        String token = jwtService.generateToken(
                employee.getEmail(),
                employee.getRole().name()
        );

        return new AuthResponse(
                token,
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getRole().name()
        );
    }
}