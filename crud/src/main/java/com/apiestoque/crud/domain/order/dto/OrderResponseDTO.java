package com.apiestoque.crud.domain.order.dto;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Date;

import com.apiestoque.crud.domain.order.Order;

public record OrderResponseDTO(
    String id,
    String customerId,
    String productId,
    Integer quantity,
    BigDecimal totalPrice,
    String paymentMethod,
    OrderStatus status,
    LocalDateTime orderDate,
    Date createdAt
) {
    public OrderResponseDTO(Order order) {
        this(
            order.getId(), 
            order.getCustomer().getId(), 
            order.getProduct().getId(), 
            order.getQuantity(), 
            order.getTotalPrice(), 
            order.getPaymentMethod(), 
            order.getStatus(), 
            order.getOrderDate(), 
            order.getCreatedAt()
        );
    }

}
