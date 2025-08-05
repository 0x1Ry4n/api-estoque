package com.apiestoque.crud.services;

import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.customer.Customer;
import com.apiestoque.crud.domain.customer.dto.CustomerResponseDTO;
import com.apiestoque.crud.domain.order.*;
import com.apiestoque.crud.domain.order.dto.OrderItemResponseDTO;
import com.apiestoque.crud.domain.order.dto.OrderRequestDTO;
import com.apiestoque.crud.domain.order.dto.OrderResponseDTO;
import com.apiestoque.crud.domain.order.dto.OrderStatus;
import com.apiestoque.crud.repositories.CustomerRepository;
import com.apiestoque.crud.repositories.InventoryRepository;
import com.apiestoque.crud.repositories.OrderRepository;
import com.apiestoque.crud.repositories.ProductRepository;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.apiestoque.crud.infra.exceptions.BadRequestException;
import com.apiestoque.crud.infra.exceptions.NotFoundException;
import lombok.AllArgsConstructor;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CustomerRepository customerRepository;

    @CacheEvict(value = "orders_all", allEntries = true)
    @Transactional
    public OrderResponseDTO create(OrderRequestDTO data) {
        if (data.items() == null || data.items().isEmpty()) {
            throw new BadRequestException("O pedido deve conter ao menos um item!");
        }

        Customer customer = customerRepository.findById(data.customerId())
                .orElseThrow(() -> new NotFoundException("Cliente não encontrado!"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus(data.status());
        order.setPaymentMethod(data.paymentMethod());
        order.setDeliveryDate(data.deliveryDate());
        order.setObservation(data.observation());

        if (data.cancelReason() != null) {
            if (!OrderStatus.CANCELED.equals(data.status())) {
                throw new BadRequestException("Motivo de cancelamento só pode ser definido se o status for CANCELADO!");
            }
            order.setCancelReason(data.cancelReason());
        }

        List<OrderItem> items = data.items().stream()
                .map(itemDto -> {
                    Product product = productRepository.findById(itemDto.productId())
                            .orElseThrow(() -> new NotFoundException("Produto não encontrado!"));

                    if (itemDto.quantity() == null || itemDto.quantity() <= 0) {
                        throw new BadRequestException("A quantidade de compra deve ser maior que 0!");
                    }
                    
                    if (itemDto.unitPrice() == null || itemDto.unitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                        throw new BadRequestException("O preço unitário deve ser maior que 0!");
                    }

                    OrderItem item = new OrderItem();
                    item.setProduct(product);
                    item.setQuantity(itemDto.quantity());
                    item.setUnitPrice(itemDto.unitPrice());
                    item.setUnit(itemDto.unit());

                    if (!inventoryRepository.existsByInventoryCode(itemDto.inventoryCode())) {
                        throw new BadRequestException("Inventário não encontrado!");
                    }

                    item.setInventoryCode(itemDto.inventoryCode());
                    item.setOrderItemType(itemDto.orderItemType());
                    item.setOrder(order);
                    return item;
                }).collect(Collectors.toList());

        order.setItems(items);

        BigDecimal total = items.stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(total);

        return toResponseDTO(orderRepository.save(order));
    }

    @CachePut(value = "orders", key = "#orderNumber")
    @Transactional
    public OrderResponseDTO update(Long orderNumber, OrderRequestDTO data) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new NotFoundException("Pedido não encontrado!"));

        if (data.status() != null) {
            order.setStatus(data.status());
        }

        if (data.deliveryDate() != null) {
            order.setDeliveryDate(data.deliveryDate());
        }

        if (data.observation() != null) {
            order.setObservation(data.observation());
        }

        if (data.cancelReason() != null) {
            if (!OrderStatus.CANCELED.equals(data.status())) {
                throw new BadRequestException("Motivo de cancelamento só pode ser definido se o status for CANCELADO!");
            }
            order.setCancelReason(data.cancelReason());
        }

        if (data.paymentMethod() != null) {
            order.setPaymentMethod(data.paymentMethod());
        }

        if (data.items() != null && !data.items().isEmpty()) {
            order.getItems().clear();

            List<OrderItem> newItems = data.items().stream().map(itemDto -> {
                Product product = productRepository.findById(itemDto.productId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Produto não encontrado."));

                if (itemDto.quantity() == null || itemDto.quantity() <= 0) {
                    throw new BadRequestException("A quantidade de compra deve ser maior que 0!");
                }

                if (itemDto.unitPrice() == null || itemDto.unitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                    throw new BadRequestException("O preço unitário deve ser maior que 0!");
                }

                return new OrderItem(
                        order,
                        itemDto.orderItemType(),
                        product,
                        itemDto.quantity(),
                        itemDto.unitPrice(),
                        itemDto.inventoryCode());
            }).collect(Collectors.toList());

            order.getItems().addAll(newItems);

            BigDecimal totalAmount = newItems.stream()
                    .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            order.setTotalAmount(totalAmount);
        }

        Order updatedOrder = orderRepository.save(order);
        return new OrderResponseDTO(updatedOrder);
    }

    public Page<OrderResponseDTO> getAll(Pageable pageable) {
        Page<OrderResponseDTO> orderPage = orderRepository.findAll(pageable)
                .map(OrderResponseDTO::new);

        return orderPage;
    }

    @Cacheable(value = "orders_all")
    public List<OrderResponseDTO> getAll() {
        return orderRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "orders", key = "#orderNumber")
    public OrderResponseDTO getByOrderNumber(Long orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new NotFoundException("Pedido não encontrado!"));

        return toResponseDTO(order);
    }

    private OrderResponseDTO toResponseDTO(Order order) {
        return new OrderResponseDTO(
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
                order.getCreatedAt() != null
                        ? order.getCreatedAt().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime()
                                .toString()
                        : null,
                order.getLastModifiedBy(),
                order.getUpdatedAt() != null
                        ? order.getUpdatedAt().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime()
                                .toString()
                        : null);

    }
}
