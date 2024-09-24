package com.apiestoque.crud.domain.order.dto;

import com.apiestoque.crud.domain.customer.dto.CustomerResponseDTO;
import com.apiestoque.crud.domain.order.Order;
import com.apiestoque.crud.domain.product.dto.ProductDetailedResponseDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderDetailsResponseDTO(
    String orderId,
    Integer quantity,
    BigDecimal totalPrice,
    OrderPaymentMethod paymentMethod,
    OrderStatus orderStatus,
    LocalDateTime orderDate,
    ProductDetailedResponseDTO product,
    CustomerResponseDTO customer
) {
    public OrderDetailsResponseDTO(Order order) {
        this(
            order.getId(),
            order.getQuantity(),
            order.getTotalPrice(),
            order.getPaymentMethod(),
            order.getStatus(),
            order.getOrderDate(),
            new ProductDetailedResponseDTO(order.getProduct()),
            new CustomerResponseDTO(order.getCustomer())
        );
    }
}
