package com.apiestoque.crud.domain.order.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

import com.apiestoque.crud.domain.order.OrderItem;

public record OrderItemResponseDTO(
        String productId,
        String productName,
        String productCategory,
        Integer quantity,
        BigDecimal unitPrice,
        String unit,
        String inventoryCode,
        OrderItemType orderItemType
) {
    public OrderItemResponseDTO(OrderItem item) {
        this(
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getCategory().getName(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getUnit(),
                item.getInventoryCode(),
                item.getOrderItemType()
        );
    }
}