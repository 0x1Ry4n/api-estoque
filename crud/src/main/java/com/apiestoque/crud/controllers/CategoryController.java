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

import com.apiestoque.crud.domain.product.category.Category;
import com.apiestoque.crud.domain.product.category.dto.CategoryRequestDTO;
import com.apiestoque.crud.domain.product.category.dto.CategoryResponseDTO;
import com.apiestoque.crud.domain.product.category.dto.CategoryUpdateDTO;
import com.apiestoque.crud.domain.product.dto.ProductResponseDTO;
import com.apiestoque.crud.repositories.CategoryRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("category")
public class CategoryController {
    @Autowired
    private CategoryRepository categoryRepository;

    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(@RequestBody @Validated CategoryRequestDTO data) {
        if (categoryRepository.existsByName(data.name())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria com esse nome já existe.");
        }

        Category newCategory = new Category();
        newCategory.setName(data.name());

        Category savedCategory = this.categoryRepository.save(newCategory);
        CategoryResponseDTO responseDTO = new CategoryResponseDTO(savedCategory);

        return ResponseEntity.status(201).body(responseDTO);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(@PathVariable String id,
        @RequestBody @Validated CategoryUpdateDTO data) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada."));

        if (data.name() != null && !data.name().equals(category.getName()) &&
                categoryRepository.existsByName(data.name())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria com esse nome já existe.");
        }

        category.setName(data.name());
        Category updatedCategory = categoryRepository.save(category);

        return ResponseEntity.ok(new CategoryResponseDTO(updatedCategory));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        List<CategoryResponseDTO> categoryList = categoryRepository.findAll().stream()
                .map(CategoryResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(categoryList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> getCategoryById(@PathVariable String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada."));

        return ResponseEntity.ok(new CategoryResponseDTO(category));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<List<CategoryResponseDTO>> getCategoryByName(@PathVariable String name) {
        List<CategoryResponseDTO> categoryList = categoryRepository.findByName(name).stream()
                .map(CategoryResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(categoryList.isEmpty() ? List.of() : categoryList);
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<List<ProductResponseDTO>> getProductsBySupplier(@PathVariable String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado."));

        List<ProductResponseDTO> productList = category.getProducts().stream()
                .map(ProductResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(productList);
    }
}
