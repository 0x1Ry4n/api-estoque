package com.apiestoque.crud.domain.order.dto;

public enum PaymentMethod {
    PIX("Pix"),
    MONEY("Money"), 
    CREDIT_CARD("Credit_Card"), 
    DEBIT_CARD("Debit_Card"),
    BANK_SLIP("Bank_Slip");

    private String status;

    PaymentMethod(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return this.status;
    }
}
