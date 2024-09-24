package com.apiestoque.crud.domain.order.dto;

public record OrderRequestDTO(
    String customerId,
    String productId,
    Integer quantity,
    OrderPaymentMethod paymentMethod,
    OrderStatus status
) {}
