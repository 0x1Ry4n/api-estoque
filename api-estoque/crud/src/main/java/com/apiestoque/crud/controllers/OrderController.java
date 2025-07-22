package com.apiestoque.crud.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.apiestoque.crud.controllers.base.CrudController;
import com.apiestoque.crud.domain.order.dto.OrderRequestDTO;
import com.apiestoque.crud.domain.order.dto.OrderResponseDTO;
import com.apiestoque.crud.services.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController
        implements CrudController<Long, OrderRequestDTO, OrderRequestDTO, OrderResponseDTO> {

    @Autowired
    private OrderService orderService;

    @Override
    @PostMapping
    public ResponseEntity<OrderResponseDTO> create(@RequestBody @Validated OrderRequestDTO data) {
        OrderResponseDTO response = orderService.create(data);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{orderNumber}")
    public ResponseEntity<OrderResponseDTO> update(@PathVariable Long orderNumber,
            @RequestBody @Validated OrderRequestDTO data) {
        OrderResponseDTO response = orderService.update(orderNumber, data);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping
    public ResponseEntity<?> getAll(
            Pageable pageable,
            @RequestParam(defaultValue = "true") boolean paged) {

        if (paged) {
            Page<OrderResponseDTO> page = orderService.getAll(pageable);
            return ResponseEntity.ok(page);
        } else {
            List<OrderResponseDTO> list = orderService.getAll();
            return ResponseEntity.ok(list);
        }
    }

    @Override
    @GetMapping("/{orderNumber}")
    public ResponseEntity<OrderResponseDTO> getById(@PathVariable Long orderNumber) {
        return ResponseEntity.ok(orderService.getByOrderNumber(orderNumber));
    }

    @Override
    @DeleteMapping("/{orderNumber}")
    public ResponseEntity<?> delete(@PathVariable Long orderNumber) {
        return ResponseEntity
                .status(HttpStatus.NOT_IMPLEMENTED)
                .body("Método não implementado.");
    }
}
