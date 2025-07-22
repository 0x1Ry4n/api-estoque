package com.apiestoque.crud.domain.order.dto;

public enum OrderStatus {
    PENDING("Pending"), 
    IN_TRANSIT("In_Transit"), 
    DELIVERED("Delivered"), 
    CANCELED("Canceled");

    private String status;
    
    OrderStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return this.status;
    }
}
