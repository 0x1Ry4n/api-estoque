package com.apiestoque.crud.domain.order.dto;

public enum OrderItemType {
    PRODUCT("Product"),
    SERVICE("Service"), 
    GIFT("Gift"),
    BONUS("Bonus"); 

    private String status; 

    OrderItemType(String status) {
        this.status = status;
    }

    public String getStatus() {
        return this.status;
    }
}
