package com.apiestoque.crud.domain.exit.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.apiestoque.crud.domain.exit.Exit;

public record ExitResponseDTO(
        String id,
        String productId,
        String productName,
        BigDecimal unitPrice,
        BigDecimal totalPrice,
        Integer quantity,
        String inventoryCode,
        ExitStatus status,
        LocalDate exitDate) {   
    public ExitResponseDTO(Exit exit) {
        this(
            exit.getId(),
            exit.getProduct().getId(),
            exit.getProduct().getName(),
            exit.getProduct().getUnitPrice(),
            exit.getProduct().getUnitPrice().multiply(BigDecimal.valueOf(exit.getQuantity())),
            exit.getQuantity(),
            exit.getInventoryCode(),
            exit.getStatus(), 
            exit.getExitDate()
        );
    }
}
