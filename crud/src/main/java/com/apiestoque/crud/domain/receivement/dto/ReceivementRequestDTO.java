package com.apiestoque.crud.domain.receivement.dto;


import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record ReceivementRequestDTO(
    @NotNull(message = "Product ID is required") 
    String productId,
    
    @NotNull(message = "Supplier ID is required") 
    String supplierId,

    String description,

    @NotNull(message = "Inventory code is required")
    String inventoryId,
    
    @NotNull(message = "Quantity is required") 
    Integer quantity,

    @NotNull(message = "Receiving date is required")
    LocalDate receivingDate,

    @NotNull(message = "Receivement status is required")
    ReceivementStatus status 
) {}
