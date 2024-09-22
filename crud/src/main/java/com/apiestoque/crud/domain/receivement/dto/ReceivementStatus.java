package com.apiestoque.crud.domain.receivement.dto;

public enum ReceivementStatus {
    PENDING("Pending"),      
    COMPLETED("Completed"), 
    CANCELED("Canceled"),    
    RETURNED("Returned");    

    private final String description;

    ReceivementStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return this.description;
    }
}
