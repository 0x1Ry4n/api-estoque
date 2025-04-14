package com.apiestoque.crud.domain.exit.dto;

import java.time.LocalDate;

import com.apiestoque.crud.domain.exit.Exit;

public record ExitResponseDTO(
    String id,
    String productId,
    Integer quantity, 
    String inventoryCode,
    ExitStatus status, 
    LocalDate exitDate
) {
    public ExitResponseDTO(Exit exit) {
        this(
            exit.getId(),
            exit.getProduct().getId(),
            exit.getQuantity(),
            exit.getInventoryCode(),
            exit.getStatus(), 
            exit.getExitDate()
        );
    }
}
