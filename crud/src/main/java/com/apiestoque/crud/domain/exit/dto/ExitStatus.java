package com.apiestoque.crud.domain.exit.dto;

public enum ExitStatus {
    PENDING("Pending"),      
    COMPLETED("Completed"), 
    CANCELED("Canceled"),    
    RETURNED("Returned");    

    private final String description;

    ExitStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return this.description;
    }
}
