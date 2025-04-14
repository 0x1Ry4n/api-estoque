package com.apiestoque.crud.domain.receivement.dto;

import com.apiestoque.crud.domain.receivement.Receivement;
import java.math.BigDecimal;

public record ReceivementResponseDTO(
    String id,
    String productId,
    String supplierId,
    String supplierName,
    String inventoryCode,
    String description,
    Integer quantity,
    BigDecimal totalPrice,
    String receivingDate,
    ReceivementStatus status
) {
    public ReceivementResponseDTO(Receivement receivement) {
        this(
            receivement.getId(),
            receivement.getProduct().getId(),
            receivement.getSupplier().getId(),
            receivement.getSupplier().getSocialReason(),
            receivement.getInventoryCode(),
            receivement.getDescription(),
            receivement.getQuantity(),
            receivement.getTotalPrice(),
            receivement.getReceivingDate().toString(), 
            receivement.getStatus()
        );
    }
}
