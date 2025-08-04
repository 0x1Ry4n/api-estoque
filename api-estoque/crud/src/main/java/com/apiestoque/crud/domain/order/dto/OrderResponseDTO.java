package com.apiestoque.crud.domain.order.dto;

import com.apiestoque.crud.domain.customer.dto.CustomerResponseDTO;
import com.apiestoque.crud.domain.order.Order;
import com.apiestoque.crud.domain.order.OrderItem;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

public record OrderResponseDTO(
        String id,
        Long orderNumber,
        Long invoiceNumber,
        Long packingNumber,
        CustomerResponseDTO customer,
        List<OrderItemResponseDTO> items,
        BigDecimal totalAmount,
        String status,
        String paymentMethod,
        String deliveryDate,
        String observation,
        String cancelReason,
        String createdBy,
        String createdAt,
        String lastModifiedBy,
        String updatedAt
) {
    public OrderResponseDTO(Order order) {
        this(
            order.getId(),
            order.getOrderNumber(),
            order.getInvoiceNumber(),
            order.getPackingNumber(),
            new CustomerResponseDTO(order.getCustomer()),
            order.getItems().stream()
                    .map(OrderItemResponseDTO::new)
                    .collect(Collectors.toList()),
            order.getTotalAmount(),
            order.getStatus() != null ? order.getStatus().name() : null,
            order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
            order.getDeliveryDate() != null ? order.getDeliveryDate().toString() : null,
            order.getObservation(),
            order.getCancelReason(),
            order.getCreatedBy(),
            order.getCreatedAt() != null ? order.getCreatedAt().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime().toString() : null,
            order.getLastModifiedBy(),
            order.getUpdatedAt() != null ? order.getUpdatedAt().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime().toString() : null
        );
    }
}
