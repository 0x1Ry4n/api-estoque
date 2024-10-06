package com.apiestoque.crud.domain.customer.dto;

public enum CustomerCommunicationPreference {
    EMAIL("Email"),
    PHONE("Phone number"),
    SMS("SMS"),
    ANY("Any");

    private String description;

    CustomerCommunicationPreference(String description) {
        this.description = description;
    }

    public String getCommunicationPreference() {
        return this.description;
    }
}
