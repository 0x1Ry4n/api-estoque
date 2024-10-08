package com.apiestoque.crud.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.apiestoque.crud.domain.customer.dto.CustomerResponseDTO;
import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.product.dto.ProductResponseDTO;
import com.apiestoque.crud.domain.supplier.Supplier;
import com.apiestoque.crud.domain.supplier.dto.SupplierRequestDTO;
import com.apiestoque.crud.domain.supplier.dto.SupplierResponseDTO;
import com.apiestoque.crud.domain.supplier.dto.SupplierUpdateRequestDTO;
import com.apiestoque.crud.repositories.ProductRepository;
import com.apiestoque.crud.repositories.SupplierRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/supplier")
public class SupplierController {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping
    public ResponseEntity<SupplierResponseDTO> createSupplier(@RequestBody @Validated SupplierRequestDTO data) {
        if (supplierRepository.existsByEmail(data.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fornecedor com este e-mail já existe.");
        }

        if (supplierRepository.existsByPhone(data.phone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fornecedor com este telefone já existe.");
        }

        Supplier newSupplier = new Supplier(data.name(), data.email(), data.phone());
        Supplier savedSupplier = supplierRepository.save(newSupplier);
        return ResponseEntity.status(HttpStatus.CREATED).body(new SupplierResponseDTO(savedSupplier));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> updateSupplier(@PathVariable String id,
            @RequestBody @Validated SupplierUpdateRequestDTO data) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado."));

        if (data.email() != null && !supplier.getEmail().equals(data.email()) &&
                supplierRepository.existsByEmail(data.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fornecedor com este e-mail já existe.");
        }

        if (data.phone() != null && !supplier.getPhone().equals(data.phone()) &&
                supplierRepository.existsByPhone(data.phone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fornecedor com este telefone já existe.");
        }

        if (data.name() != null) {
            supplier.setName(data.name());
        }
        if (data.email() != null) {
            supplier.setEmail(data.email());
        }
        if (data.phone() != null) {
            supplier.setPhone(data.phone());
        }

        Supplier updatedSupplier = supplierRepository.save(supplier);
        return ResponseEntity.ok(new SupplierResponseDTO(updatedSupplier));
    }

    @GetMapping
    public ResponseEntity<Page<SupplierResponseDTO>> getAllSuppliers(Pageable pageable) {
        var supplierPage = supplierRepository.findAll(pageable)
                .map(SupplierResponseDTO::new);

        return ResponseEntity.ok(supplierPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> getSupplierById(@PathVariable String id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado."));
        return ResponseEntity.ok(new SupplierResponseDTO(supplier));
    }

    @GetMapping("/{supplierId}/products")
    public ResponseEntity<List<ProductResponseDTO>> getProductsBySupplierId(@PathVariable String supplierId) {
        Optional<Supplier> supplier = supplierRepository.findById(supplierId);

        if (supplier.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado.");
        }

        List<Product> products = productRepository.findBySuppliersId(supplierId);
        List<ProductResponseDTO> productList = products.stream()
                .map(ProductResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(productList.isEmpty() ? List.of() : productList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> deleteProductById(@PathVariable String id) {
        supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado."));

        this.supplierRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
