package com.apiestoque.crud.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.product.category.Category;
import com.apiestoque.crud.domain.product.dto.ProductDetailedResponseDTO;
import com.apiestoque.crud.domain.product.dto.ProductRequestDTO;
import com.apiestoque.crud.domain.product.dto.ProductResponseDTO;
import com.apiestoque.crud.domain.product.dto.ProductUpdateDTO;
import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.domain.inventory.dto.InventoryRequestDTO;
import com.apiestoque.crud.domain.inventory.dto.InventoryResponseDTO;
import com.apiestoque.crud.repositories.CategoryRepository;
import com.apiestoque.crud.repositories.ProductRepository;
import com.apiestoque.crud.repositories.SupplierRepository;
import com.apiestoque.crud.repositories.InventoryRepository;
import com.apiestoque.crud.domain.supplier.Supplier;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Set;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(@RequestBody @Validated ProductRequestDTO data) {
        Category category = categoryRepository.findById(data.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada."));

        Set<Supplier> suppliers = data.suppliersId().stream()
                .map(supplierId -> supplierRepository.findById(supplierId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Fornecedor não encontrado com ID: " + supplierId)))
                .collect(Collectors.toSet());

        Product newProduct = new Product(
                data.name(),
                data.description(),
                data.unitPrice(),
                category,
                suppliers,
                data.expirationDate());

        Product savedProduct = this.productRepository.save(newProduct);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ProductResponseDTO(savedProduct));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(@PathVariable String id,
            @RequestBody @Validated ProductUpdateDTO data) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        if (data.name() != null) {
            product.setName(data.name());
        }

        if (data.description() != null) {
            product.setDescription(data.description());
        }

        if (data.price() != null) {
            product.setUnitPrice(data.price());
        }

        if (data.expirationDate() != null) {
            product.setExpirationDate(data.expirationDate());
        }

        Product updatedProduct = productRepository.save(product);
        return ResponseEntity.ok(new ProductResponseDTO(updatedProduct));
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponseDTO>> getAllProducts(Pageable pageable) {
        Page<ProductResponseDTO> productPage = productRepository.findAll(pageable)
                .map(ProductResponseDTO::new);
        return ResponseEntity.ok(productPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailedResponseDTO> getProductById(@PathVariable String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));
        return ResponseEntity.ok(new ProductDetailedResponseDTO(product));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<List<ProductResponseDTO>> getProductByName(@PathVariable String name) {
        List<Product> products = productRepository.findByName(name);
        List<ProductResponseDTO> productList = products.stream()
                .map(ProductResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(productList.isEmpty() ? List.of() : productList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ProductDetailedResponseDTO> deleteProductById(@PathVariable String id) {
        productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        this.productRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{productId}/inventory")
    public ResponseEntity<InventoryResponseDTO> createInventory(@PathVariable String productId,
            @RequestBody @Validated InventoryRequestDTO data) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        if (data.quantity() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantidade do inventário deve ser maior que 0!");
        }

        Inventory inventory = new Inventory(
                product,
                data.quantity(),
                data.discount(),
                data.location());

        Inventory savedInventory = inventoryRepository.save(inventory);

        product.setStockQuantity(product.getStockQuantity() + data.quantity());
        product.setOriginalStockQuantity(product.getOriginalStockQuantity() + data.quantity());
        productRepository.save(product);

        return ResponseEntity.status(HttpStatus.CREATED).body(new InventoryResponseDTO(savedInventory));
    }

    @GetMapping("/inventory")
    public ResponseEntity<Page<InventoryResponseDTO>> getAllInventories(Pageable pageable) {
        Page<InventoryResponseDTO> productPage = inventoryRepository.findAll(pageable)
                .map(InventoryResponseDTO::new);
        return ResponseEntity.ok(productPage);
    }

    @GetMapping("{id}/inventory")
    public ResponseEntity<List<InventoryResponseDTO>> getInventoryById(@PathVariable String id) {
        List<Inventory> inventories = inventoryRepository.findAllByProductId(id);
        
        if (inventories.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventários não encontrados.");
        }
    
        List<InventoryResponseDTO> inventoryResponseDTOs = inventories.stream()
                .map(InventoryResponseDTO::new) 
                .collect(Collectors.toList());
    
        return ResponseEntity.ok(inventoryResponseDTOs);
    }

    @PatchMapping("/{productId}/inventory/{inventoryId}")
    public ResponseEntity<InventoryResponseDTO> updateInventory(@PathVariable String productId,
            @PathVariable String inventoryId, @RequestBody @Validated InventoryRequestDTO data) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventário não encontrado."));

        if (!inventory.getProduct().getId().equals(productId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O inventário não pertence a este produto.");
        }

        if (data.quantity() != null) {
            inventory.setQuantity(data.quantity());
            inventory.setOriginalQuantity(data.quantity());
            product.setStockQuantity(data.quantity());
            product.setOriginalStockQuantity(data.quantity());
        }

        if (data.discount() != null) {
            inventory.setDiscount(data.discount());
        }

        Inventory updatedInventory = inventoryRepository.save(inventory);
        return ResponseEntity.ok(new InventoryResponseDTO(updatedInventory));
    }

    @DeleteMapping("/{productId}/inventory/{inventoryId}")
    public ResponseEntity<Void> deleteInventory(@PathVariable String productId, @PathVariable String inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventário não encontrado."));
        
        if (!inventory.getProduct().getId().equals(productId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O inventário não pertence a este produto.");
        }

        Product product = inventory.getProduct();
        
        product.setStockQuantity(product.getStockQuantity() - inventory.getQuantity());
        product.setOriginalStockQuantity(product.getOriginalStockQuantity() - inventory.getQuantity());
        productRepository.save(product);

        inventoryRepository.delete(inventory);

        return ResponseEntity.noContent().build();
    }
}
