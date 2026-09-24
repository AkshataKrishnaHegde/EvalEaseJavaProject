package com.evalease.evalease_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private Long id;
    private String name;
    private String email;
    private String role;
}