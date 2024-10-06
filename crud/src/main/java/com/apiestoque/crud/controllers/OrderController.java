package com.apiestoque.crud.controllers;

import com.apiestoque.crud.domain.customer.Customer;
import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.repositories.InventoryRepository;
import com.apiestoque.crud.domain.order.Order;
import com.apiestoque.crud.domain.order.dto.OrderDetailsResponseDTO;
import com.apiestoque.crud.domain.order.dto.OrderRequestDTO;
import com.apiestoque.crud.domain.order.dto.OrderResponseDTO;
import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.repositories.CustomerRepository;
import com.apiestoque.crud.repositories.OrderRepository;
import com.apiestoque.crud.repositories.ProductRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody @Validated OrderRequestDTO data) {
        Customer customer = customerRepository.findById(data.customerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado."));

        Product product = productRepository.findById(data.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        Inventory inventory = inventoryRepository.findById(data.inventoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventário não encontrado."));

        if (data.quantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A quantidade deve ser maior que zero.");
        }

        if (data.quantity() > inventory.getQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantidade indisponível no estoque.");
        }

        inventory.setQuantity(inventory.getQuantity() - data.quantity());
        inventoryRepository.save(inventory);

        product.setStockQuantity(product.getStockQuantity() - data.quantity());
        productRepository.save(product);

        BigDecimal totalPrice = inventory.getProduct().getUnitPrice().multiply(BigDecimal.valueOf(data.quantity()));

        Order newOrder = new Order(
                customer,
                inventory,
                data.quantity(),
                totalPrice,
                data.paymentMethod(),
                data.status());

        Order savedOrder = orderRepository.save(newOrder);

        return ResponseEntity.status(HttpStatus.CREATED).body(new OrderResponseDTO(savedOrder));
    }

    @GetMapping
    public ResponseEntity<Page<OrderResponseDTO>> getAllOrders(Pageable pageable) {
        Page<OrderResponseDTO> orderPage = orderRepository.findAll(pageable)
                .map(OrderResponseDTO::new);
        return ResponseEntity.ok(orderPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));

        return ResponseEntity.ok(new OrderResponseDTO(order));
    }

    @GetMapping("/details")
    public ResponseEntity<Page<OrderDetailsResponseDTO>> getAllOrderDetails(Pageable pageable) {
        Page<Order> ordersPage = orderRepository.findAll(pageable);
    
        if (ordersPage.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum pedido encontrado.");
        }
    
        Page<OrderDetailsResponseDTO> orderDetailsPage = ordersPage.map(order -> {
            Inventory inventory = inventoryRepository.findById(order.getInventory().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Inventário não encontrado para o pedido com ID: " + order.getId()));
            return new OrderDetailsResponseDTO(order, inventory);
        });
    
        return ResponseEntity.ok(orderDetailsPage);
    }
    

    @GetMapping("/{orderID}/details")
    public ResponseEntity<OrderDetailsResponseDTO> getOrderDetails(@PathVariable String orderID) {
        Order order = orderRepository.findById(orderID)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));

        Inventory inventory = inventoryRepository.findById(order.getInventory().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Inventário não encontrado para este pedido."));

        return ResponseEntity.ok(new OrderDetailsResponseDTO(order, inventory));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByCustomerId(@PathVariable String customerId) {
        List<Order> orders = orderRepository.findByCustomerId(customerId);

        if (orders.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum pedido encontrado para o cliente.");
        }

        List<OrderResponseDTO> orderList = orders.stream()
                .map(OrderResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(orderList);
    }

    @DeleteMapping("/{orderId}")
    @Transactional 
    public ResponseEntity<Void> deleteOrder(@PathVariable String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado!"));

        Inventory inventory = order.getInventory();
        int quantityOrdered = order.getQuantity();

        inventory.setQuantity(inventory.getQuantity() + quantityOrdered);
        inventoryRepository.save(inventory);

        Product product = inventory.getProduct();
        product.setStockQuantity(product.getStockQuantity() + quantityOrdered);
        productRepository.save(product);

        orderRepository.delete(order);

        return ResponseEntity.noContent().build(); 
    }
}
