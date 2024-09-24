package com.apiestoque.crud.domain.customer.dto;

public enum CustomerPreferredPaymentMethod {
    CREDIT_CARD("CREDITCARD"),
    MONEY("MONEY"),
    ANY("ANY");

    private String description;

    CustomerPreferredPaymentMethod(String description) {
        this.description = description;
    }

    public String getPreferredPaymentMethod() {
        return this.description;
    }
}
