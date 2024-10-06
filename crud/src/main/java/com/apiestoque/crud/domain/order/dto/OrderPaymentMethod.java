package com.apiestoque.crud.domain.order.dto;

public enum OrderPaymentMethod {
    CREDIT_CARD("Credit card"),
    DEBIT_CARD("Debit card"),
    PIX("Pix"),
    MONEY("Money"),
    ANY("Any");

    private final String description;

    OrderPaymentMethod(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
