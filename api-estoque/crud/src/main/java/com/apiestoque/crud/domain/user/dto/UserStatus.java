package com.apiestoque.crud.domain.user.dto;

public enum UserStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive");

    private String status;


    UserStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return this.status;
    }
}