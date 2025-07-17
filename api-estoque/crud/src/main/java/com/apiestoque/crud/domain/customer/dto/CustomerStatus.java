package com.apiestoque.crud.domain.customer.dto;

public enum CustomerStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    BLOCKED("Blocked"),
    SUSPENDED("Suspended");

    private final String label;

    CustomerStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return this.label;
    }
}
