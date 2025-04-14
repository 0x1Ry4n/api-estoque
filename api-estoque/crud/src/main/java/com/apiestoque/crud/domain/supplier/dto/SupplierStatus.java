package com.apiestoque.crud.domain.supplier.dto;

public enum SupplierStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive");

    private String status;

    SupplierStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return this.status;
    }
}
