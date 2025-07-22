package com.apiestoque.crud.domain.order.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

import com.apiestoque.crud.domain.order.OrderItem;

public record OrderItemDTO(
        @NotBlank(message = "ID do produto é obrigatório") String productId,

        @NotNull(message = "Quantidade é obrigatória") @Min(value = 1, message = "Quantidade deve ser maior que zero") Integer quantity,

        @NotNull(message = "Preço unitário é obrigatório") @DecimalMin(value = "0.01", message = "Preço unitário deve ser maior que zero") BigDecimal unitPrice,

        String unit,

        @NotBlank(message = "Código de inventário é obrigatório") String inventoryCode,

        @NotBlank(message = "Tipo do item é obrigatório") OrderItemType orderItemType) {
    public OrderItemDTO(OrderItem item) {
        this(
                item.getProduct().getId(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getUnit(),
                item.getInventoryCode(),
                item.getOrderItemType());
    }
}