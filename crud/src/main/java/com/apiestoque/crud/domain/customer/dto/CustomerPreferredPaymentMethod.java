package com.apiestoque.crud.domain.customer.dto;

public enum CustomerPreferredPaymentMethod {
    CREDIT_CARD("Credit card"),
    MONEY("Money"),
    ANY("Any");

    private String description;

    CustomerPreferredPaymentMethod(String description) {
        this.description = description;
    }

    public String getPreferredPaymentMethod() {
        return this.description;
    }
}
