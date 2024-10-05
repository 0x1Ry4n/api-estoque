package com.apiestoque.crud.domain.order.dto;

import com.apiestoque.crud.domain.customer.dto.CustomerResponseDTO;
import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.domain.inventory.dto.InventoryResponseDTO;
import com.apiestoque.crud.domain.order.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderDetailsResponseDTO(
    String orderId,
    Integer quantity,
    OrderPaymentMethod paymentMethod,
    OrderStatus orderStatus,
    BigDecimal totalPrice,
    CustomerResponseDTO customer,
    InventoryResponseDTO inventory,
    LocalDateTime orderDate
) {
    public OrderDetailsResponseDTO(Order order, Inventory inventory) {
        this(
            order.getId(),
            order.getQuantity(),
            order.getPaymentMethod(),
            order.getStatus(),
            order.getTotalPrice(),
            new CustomerResponseDTO(order.getCustomer()),
            new InventoryResponseDTO(inventory),
            order.getOrderDate()
        );
    }
}
            