package com.apiestoque.crud.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.apiestoque.crud.controllers.base.CrudController;
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
public class SupplierController implements CrudController<String, SupplierRequestDTO, SupplierUpdateRequestDTO, SupplierResponseDTO> {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    @PostMapping
    public ResponseEntity<SupplierResponseDTO> create(@RequestBody @Validated SupplierRequestDTO data) {
        if (supplierRepository.existsByEmail(data.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fornecedor com este e-mail já existe.");
        }

        if (supplierRepository.existsByPhone(data.phone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fornecedor com este telefone já existe.");
        }

        if (supplierRepository.existsByCnpj(data.cnpj())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fornecedor com este CNPJ já existe.");
        }

        Supplier newSupplier = new Supplier(data.socialReason(), data.email(), data.phone(), data.cnpj(), data.website(), data.contactPerson(), data.cep(), data.communicationPreference());
        Supplier savedSupplier = supplierRepository.save(newSupplier);
        return ResponseEntity.status(HttpStatus.CREATED).body(new SupplierResponseDTO(savedSupplier));
    }

    @Override
    @PatchMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> update(@PathVariable String id,
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

        if (data.socialReason() != null) {
            supplier.setSocialReason(data.socialReason());
        }
        if (data.email() != null) {
            supplier.setEmail(data.email());
        }
        if (data.phone() != null) {
            supplier.setPhone(data.phone());
        }
        if (data.website() != null) {
            supplier.setWebsite(data.website());
        }
        if (data.contactPerson() != null) {
            supplier.setContactPerson(data.contactPerson());
        }
        if (data.cep() != null) {
            supplier.setCep(data.cep());
        }

        Supplier updatedSupplier = supplierRepository.save(supplier);
        return ResponseEntity.ok(new SupplierResponseDTO(updatedSupplier));
    }

    @Override
    @GetMapping
    public ResponseEntity<Page<SupplierResponseDTO>> getAll(Pageable pageable) {
        var supplierPage = supplierRepository.findAll(pageable)
                .map(SupplierResponseDTO::new);

        return ResponseEntity.ok(supplierPage);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> getById(@PathVariable String id) {
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

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> delete(@PathVariable String id) {
        supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado."));

                
        if (productRepository.findBySuppliersId(id).size() > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O fornecedor possuí produtos associados e não pode ser excluído!");
        }

        this.supplierRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
