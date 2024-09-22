package com.apiestoque.crud.domain.customer;

public enum CustomerStatus {
    ACTIVE("Ativo"),
    INACTIVE("Inativo"),
    BANNED("Banido"),
    PENDING("Pendente");

    private final String description;

    CustomerStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
