package com.apiestoque.crud.domain.order.dto;

import com.apiestoque.crud.domain.customer.Customer;
import com.apiestoque.crud.domain.customer.dto.CustomerResponseDTO;
import com.apiestoque.crud.domain.order.Order;
import com.apiestoque.crud.domain.order.OrderItem;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record OrderResponseDTO(
                String id,
                Long orderNumber,
                Long invoiceNumber,
                Long packingNumber,
                CustomerResponseDTO customer,
                List<OrderItemDTO> items,
                BigDecimal totalAmount,
                String status,
                String paymentMethod,
                LocalDateTime deliveryDate,
                String observation,
                String cancelReason,
                String createdBy,
                LocalDateTime createdAt,
                String lastModifiedBy,
                LocalDateTime updatedAt) {
        public OrderResponseDTO(Order order) {
                this(
                                order.getId(),
                                order.getOrderNumber(),
                                order.getInvoiceNumber(),
                                order.getPackingNumber(),
                                new CustomerResponseDTO(order.getCustomer()),
                                order.getItems()
                                                .stream()
                                                .map(OrderItemDTO::new)
                                                .collect(Collectors.toList()),
                                order.getTotalAmount(),
                                order.getStatus() != null ? order.getStatus().name() : null,
                                order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
                                order.getDeliveryDate(),
                                order.getObservation(),
                                order.getCancelReason(),
                                order.getCreatedBy(),
                                order.getCreatedAt() != null ? order.getCreatedAt().toInstant()
                                                .atZone(java.time.ZoneId.systemDefault())
                                                .toLocalDateTime() : null,
                                order.getLastModifiedBy(),
                                order.getUpdatedAt() != null ? order.getUpdatedAt().toInstant()
                                                .atZone(java.time.ZoneId.systemDefault())
                                                .toLocalDateTime() : null);
        }

}
