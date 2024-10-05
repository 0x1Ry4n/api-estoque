package com.apiestoque.crud.domain.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrderRequestDTO(
    @NotBlank(message = "Customer ID is required")
    String customerId,

    @NotBlank(message = "Product ID is required")
    String productId,

    @NotBlank(message = "Inventory ID is required")
    String inventoryId,

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be greater than 0")
    Integer quantity,

    @NotNull(message = "Payment method is required")
    OrderPaymentMethod paymentMethod,

    @NotNull(message = "Status is required")
    OrderStatus status
) {}
