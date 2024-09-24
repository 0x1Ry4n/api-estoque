package com.apiestoque.crud.domain.customer.dto;

public enum CustomerCommunicationPreference {
    EMAIL("EMAIL"),
    PHONE("PHONE"),
    ANY("A");

    private String description;

    CustomerCommunicationPreference(String description) {
        this.description = description;
    }

    public String getCommunicationPreference() {
        return this.description;
    }
}
