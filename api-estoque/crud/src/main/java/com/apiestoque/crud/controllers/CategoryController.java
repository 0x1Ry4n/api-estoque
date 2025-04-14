package com.apiestoque.crud.controllers;

import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.bind.annotation.RestController;

import com.apiestoque.crud.controllers.base.CrudController;
import com.apiestoque.crud.domain.product.category.dto.CategoryRequestDTO;
import com.apiestoque.crud.domain.product.category.dto.CategoryResponseDTO;
import com.apiestoque.crud.domain.product.category.dto.CategoryUpdateDTO;
import com.apiestoque.crud.domain.product.dto.ProductDetailedResponseDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

import com.apiestoque.crud.services.CategoryService;

@RestController
@RequestMapping("/api/category")
public class CategoryController implements CrudController<String, CategoryRequestDTO, CategoryUpdateDTO, CategoryResponseDTO> {
    @Autowired
    private CategoryService categoryService;

    @Override
    @PostMapping
    public ResponseEntity<CategoryResponseDTO> create(@RequestBody @Validated CategoryRequestDTO data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(data));
    }

    @Override
    @PatchMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> update(@PathVariable String id,
                                                      @RequestBody @Validated CategoryUpdateDTO data) {
        return ResponseEntity.ok(categoryService.update(id, data));
    }

    @Override
    @GetMapping
    public ResponseEntity<Page<CategoryResponseDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(categoryService.getAll(pageable));
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<List<CategoryResponseDTO>> getCategoryByName(@PathVariable String name) {
        return ResponseEntity.ok(categoryService.getByName(name));
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<ProductDetailedResponseDTO> delete(@PathVariable String id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
