package com.apiestoque.crud.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.apiestoque.crud.controllers.base.CrudController;
import com.apiestoque.crud.domain.customer.dto.CustomerRequestDTO;
import com.apiestoque.crud.domain.customer.dto.CustomerResponseDTO;
import com.apiestoque.crud.services.CustomerService;

@RestController
@RequestMapping("/api/customer")
public class CustomerController
        implements CrudController<String, CustomerRequestDTO, CustomerRequestDTO, CustomerResponseDTO> {

    @Autowired
    private CustomerService customerService;

    @Override
    @PostMapping
    public ResponseEntity<CustomerResponseDTO> create(@RequestBody @Validated CustomerRequestDTO data) {
        var response = customerService.create(data);
        return ResponseEntity.status(201).body(response);
    }

    @Override
    @PatchMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> update(@PathVariable String id,
            @RequestBody @Validated CustomerRequestDTO data) {
        var response = customerService.update(id, data);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping
    public ResponseEntity<?> getAll(Pageable pageable, @RequestParam(defaultValue = "true") boolean paged) {
        if (paged) {
            Page<CustomerResponseDTO> page = customerService.getAll(pageable);
            return ResponseEntity.ok(page);
        } else {
            List<CustomerResponseDTO> list = customerService.getAll();
            return ResponseEntity.ok(list);
        }
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> getById(@PathVariable String id) {
        var response = customerService.getById(id);
        return ResponseEntity.ok(response);
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        return ResponseEntity
                .status(HttpStatus.NOT_IMPLEMENTED)
                .body("Método não implementado.");
    }
}
