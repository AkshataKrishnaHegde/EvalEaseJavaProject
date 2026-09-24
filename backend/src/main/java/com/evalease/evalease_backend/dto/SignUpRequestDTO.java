package com.evalease.evalease_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignUpRequestDTO {

    private String name;
    private String email;
    private String password;
}