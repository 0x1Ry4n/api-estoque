package com.apiestoque.crud.domain.supplier.dto;

public enum SupplierCommunicationPreference {
    EMAIL("Email"),
    PHONE("Phone number"),
    SMS("SMS"),
    ANY("Any");

    private String description;

    SupplierCommunicationPreference(String description) {
        this.description = description;
    }

    public String getCommunicationPreference() {
        return this.description;
    }
}
