package com.apiestoque.crud.controllers;

import com.apiestoque.crud.domain.customer.Customer;
import com.apiestoque.crud.domain.order.Order;
import com.apiestoque.crud.domain.order.dto.OrderDetailsResponseDTO;
import com.apiestoque.crud.domain.order.dto.OrderRequestDTO;
import com.apiestoque.crud.domain.order.dto.OrderResponseDTO;
import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.repositories.CustomerRepository;
import com.apiestoque.crud.repositories.OrderRepository;
import com.apiestoque.crud.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@RestController
@RequestMapping("orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody @Validated OrderRequestDTO data) {
        Customer customer = customerRepository.findById(data.customerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado."));

        Product product = productRepository.findById(data.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));


        if (data.quantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantidade solicitada menor ou igual a 0.");
        }

        if (data.quantity() > product.getStockQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantidade indisponível no estoque.");
        }


        product.setStockQuantity(product.getStockQuantity() - data.quantity());
        productRepository.save(product);

        BigDecimal totalPrice = BigDecimal.valueOf(data.quantity()).multiply(product.getPrice());

        Order newOrder = new Order(
                customer,
                product,
                data.quantity(),
                totalPrice,
                data.paymentMethod(),
                data.status());

        Order savedOrder = orderRepository.save(newOrder);

        return ResponseEntity.status(HttpStatus.CREATED).body(new OrderResponseDTO(savedOrder));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        List<OrderResponseDTO> orderList = orderRepository.findAll().stream()
                .map(OrderResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orderList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));

        return ResponseEntity.ok(new OrderResponseDTO(order));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<OrderDetailsResponseDTO> getOrderDetails(@PathVariable String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));

        return ResponseEntity.ok(new OrderDetailsResponseDTO(order));
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
}
