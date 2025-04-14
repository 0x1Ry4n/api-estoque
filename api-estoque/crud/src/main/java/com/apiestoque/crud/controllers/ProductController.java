package com.apiestoque.crud.controllers;

import com.apiestoque.crud.controllers.base.CrudController;
import com.apiestoque.crud.domain.inventory.dto.InventoryRequestDTO;
import com.apiestoque.crud.domain.inventory.dto.InventoryResponseDTO;
import com.apiestoque.crud.domain.product.dto.ProductDetailedResponseDTO;
import com.apiestoque.crud.domain.product.dto.ProductRequestDTO;
import com.apiestoque.crud.domain.product.dto.ProductResponseDTO;
import com.apiestoque.crud.domain.product.dto.ProductUpdateDTO;
import com.apiestoque.crud.services.ProductService;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController implements CrudController<String, ProductRequestDTO, ProductUpdateDTO, ProductResponseDTO> {
    @Autowired
    private ProductService productService;

    @Override
    @PostMapping
    public ResponseEntity<ProductResponseDTO> create(@RequestBody @Validated ProductRequestDTO data) {
        ProductResponseDTO response = productService.create(data);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    @PatchMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> update(@PathVariable String id,
                                                     @RequestBody @Validated ProductUpdateDTO data) {
        ProductResponseDTO response = productService.update(id, data);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping
    public ResponseEntity<Page<ProductResponseDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(productService.getAll(pageable));
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailedResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<List<ProductResponseDTO>> getProductByName(@PathVariable String name) {
        return ResponseEntity.ok(productService.getProductByName(name));
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<ProductDetailedResponseDTO> delete(@PathVariable String id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Inventory endpoints delegando ao service ----

    @PostMapping("/{productId}/inventory")
    @Transactional
    public ResponseEntity<InventoryResponseDTO> createInventory(@PathVariable String productId,
                                                                 @RequestBody @Validated InventoryRequestDTO data) {
        InventoryResponseDTO response = productService.createInventory(productId, data);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/inventory")
    public ResponseEntity<Page<InventoryResponseDTO>> getAllInventories(Pageable pageable) {
        return ResponseEntity.ok(productService.getAllInventories(pageable));
    }

    @GetMapping("/{id}/inventory")
    public ResponseEntity<List<InventoryResponseDTO>> getInventoryById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getInventoryById(id));
    }

    @DeleteMapping("/{productId}/inventory/{inventoryId}")
    @Transactional
    public ResponseEntity<Void> deleteInventory(@PathVariable String productId,
                                                @PathVariable String inventoryId) {
        productService.deleteInventory(productId, inventoryId);
        return ResponseEntity.noContent().build();
    }
}
