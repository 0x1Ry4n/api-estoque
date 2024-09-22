package com.apiestoque.crud.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.product.ProductRequestDTO;
import com.apiestoque.crud.domain.product.ProductResponseDTO;
import com.apiestoque.crud.domain.product.ProductUpdateDTO;
import com.apiestoque.crud.domain.product.category.Category;
import com.apiestoque.crud.domain.supplier.Supplier;
import com.apiestoque.crud.repositories.CategoryRepository;
import com.apiestoque.crud.repositories.ProductRepository;
import com.apiestoque.crud.repositories.SupplierRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("products")
public class ProductController {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(@RequestBody @Validated ProductRequestDTO data) {
        Category category = categoryRepository.findById(data.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada."));

        Supplier supplier = null; 

        if (data.supplierId() != null) {
            supplier = supplierRepository.findById(data.supplierId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado."));
        }

        Product newProduct = new Product(
                data.name(),
                data.description(),
                data.price(),
                data.discount(),
                data.stockQuantity(),
                data.expirationDate(),
                category,
                supplier,
                supplier == null 
        );

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
            product.setPrice(data.price());
        }

        if (data.discount() != null) {
            product.setDiscount(data.discount());
        }

        if (data.stockQuantity() != null) {
            product.setStockQuantity(data.stockQuantity());
        }

        if (data.expirationDate() != null) {
            product.setExpirationDate(data.expirationDate());
        }

        if (data.categoryId() != null) {
            Category category = categoryRepository.findById(data.categoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada."));
            product.setCategory(category);
        }

        Product updatedProduct = productRepository.save(product);
        return ResponseEntity.ok(new ProductResponseDTO(updatedProduct));
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        List<ProductResponseDTO> productList = productRepository.findAll().stream()
                .map(ProductResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(productList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        return ResponseEntity.ok(new ProductResponseDTO(product));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<List<ProductResponseDTO>> getProductByName(@PathVariable String name) {
        List<Product> products = productRepository.findByName(name);
        List<ProductResponseDTO> productList = products.stream()
                .map(ProductResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(productList.isEmpty() ? List.of() : productList);
    }
}
