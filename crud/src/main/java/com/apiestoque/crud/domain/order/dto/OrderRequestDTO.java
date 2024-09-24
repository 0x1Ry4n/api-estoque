package com.apiestoque.crud.domain.order.dto;

import java.math.BigDecimal;

public record OrderRequestDTO(
    String customerId,
    String productId,
    Integer quantity,
    BigDecimal totalPrice,
    String paymentMethod,
    OrderStatus status
) {}
