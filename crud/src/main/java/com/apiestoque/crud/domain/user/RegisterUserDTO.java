package com.apiestoque.crud.domain.user;

public record RegisterUserDTO(String username, String email, String password, UserRole role) {

}
