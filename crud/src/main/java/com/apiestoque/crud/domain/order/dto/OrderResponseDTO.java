package com.apiestoque.crud.domain.order.dto;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Date;

import com.apiestoque.crud.domain.order.Order;

public record OrderResponseDTO(
    String id,
    String customerId,
    String productId,
    String inventoryId,
    OrderStatus status,
    OrderPaymentMethod paymentMethod,
    Integer quantity,
    BigDecimal totalPrice,
    LocalDateTime orderDate,
    Date createdAt
) {
    public OrderResponseDTO(Order order) {
        this(
            order.getId(), 
            order.getCustomer().getId(), 
            order.getInventory().getProduct().getId(),
            order.getInventory().getId(), 
            order.getStatus(), 
            order.getPaymentMethod(), 
            order.getQuantity(), 
            order.getTotalPrice(), 
            order.getOrderDate(), 
            order.getCreatedAt()
        );
    }

}
