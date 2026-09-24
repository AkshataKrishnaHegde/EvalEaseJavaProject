package com.evalease.evalease_backend.config;

import com.evalease.evalease_backend.entity.Employee;
import com.evalease.evalease_backend.entity.Role;
import com.evalease.evalease_backend.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeAdmin(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {

            String adminEmail = "admin@evalease.com";

            if (!employeeRepository.existsByEmail(adminEmail)) {

                Employee admin = Employee.builder()
                        .name("Admin")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("Admin@123"))
                        .role(Role.ADMIN)
                        .build();

                employeeRepository.save(admin);

                System.out.println("Default ADMIN account created.");
            }
        };
    }
}