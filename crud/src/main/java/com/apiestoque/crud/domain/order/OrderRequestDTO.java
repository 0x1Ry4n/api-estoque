package com.apiestoque.crud.domain.order;

import java.math.BigDecimal;

public record OrderRequestDTO(
    String customerId,
    String productId,
    Integer quantity,
    BigDecimal totalPrice,
    String paymentMethod,
    OrderStatus status
) {}
