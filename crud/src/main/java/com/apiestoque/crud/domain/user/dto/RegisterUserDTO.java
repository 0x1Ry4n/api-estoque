package com.apiestoque.crud.domain.user.dto;

public record RegisterUserDTO(String username, String email, String password, UserStatus status, UserRole role) {

}
