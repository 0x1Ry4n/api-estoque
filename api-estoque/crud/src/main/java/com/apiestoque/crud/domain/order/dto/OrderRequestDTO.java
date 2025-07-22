package com.apiestoque.crud.domain.order.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderRequestDTO(

    @NotNull(message = "ID do cliente é obrigatório")
    String customerId,

    @NotEmpty(message = "Lista de itens não pode ser vazia")
    List<OrderItemDTO> items,

    @NotNull(message = "Status do pedido é obrigatório")
    OrderStatus status,

    @NotNull(message = "Método de pagamento é obrigatório")
    PaymentMethod paymentMethod,

    LocalDateTime deliveryDate,

    @Size(max = 1000, message = "Observação pode ter no máximo 1000 caracteres")
    String observation,

    @Size(max = 1000, message = "Motivo de cancelamento pode ter no máximo 1000 caracteres")
    String cancelReason

) {}
