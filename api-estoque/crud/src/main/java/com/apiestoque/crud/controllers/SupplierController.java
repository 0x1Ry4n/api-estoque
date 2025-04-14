package com.apiestoque.crud.controllers;

import com.apiestoque.crud.controllers.base.CrudController;
import com.apiestoque.crud.domain.product.dto.ProductResponseDTO;
import com.apiestoque.crud.domain.supplier.dto.SupplierRequestDTO;
import com.apiestoque.crud.domain.supplier.dto.SupplierResponseDTO;
import com.apiestoque.crud.domain.supplier.dto.SupplierUpdateRequestDTO;
import com.apiestoque.crud.services.SupplierService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplier")
public class SupplierController implements CrudController<String, SupplierRequestDTO, SupplierUpdateRequestDTO, SupplierResponseDTO> {

    @Autowired
    private SupplierService supplierService;

    @Override
    @PostMapping
    public ResponseEntity<SupplierResponseDTO> create(@RequestBody @Validated SupplierRequestDTO data) {
        var response = supplierService.create(data);
        return ResponseEntity.status(201).body(response);
    }

    @Override
    @PatchMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> update(@PathVariable String id, @RequestBody @Validated SupplierUpdateRequestDTO data) {
        var response = supplierService.update(id, data);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping
    public ResponseEntity<Page<SupplierResponseDTO>> getAll(Pageable pageable) {
        var response = supplierService.getAll(pageable);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> getById(@PathVariable String id) {
        var response = supplierService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{supplierId}/products")
    public ResponseEntity<List<ProductResponseDTO>> getProductsBySupplierId(@PathVariable String supplierId) {
        var response = supplierService.getProductsBySupplierId(supplierId);
        return ResponseEntity.ok(response);
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        supplierService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
