package com.apiestoque.crud.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.apiestoque.crud.domain.product.category.Category;
import com.apiestoque.crud.domain.product.category.dto.CategoryRequestDTO;
import com.apiestoque.crud.domain.product.category.dto.CategoryResponseDTO;
import com.apiestoque.crud.domain.product.category.dto.CategoryUpdateDTO;
import com.apiestoque.crud.domain.product.dto.ProductDetailedResponseDTO;
import com.apiestoque.crud.repositories.CategoryRepository;
import com.apiestoque.crud.repositories.ProductRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    public CategoryResponseDTO create(CategoryRequestDTO data) {
        if (categoryRepository.existsByName(data.name())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria com esse nome já existe.");
        }

        Category newCategory = new Category();
        newCategory.setName(data.name());

        Category savedCategory = this.categoryRepository.save(newCategory);

        return new CategoryResponseDTO(savedCategory);
    }

    public CategoryResponseDTO update(String id, CategoryUpdateDTO data) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada."));

        if (data.name() != null && !data.name().equals(category.getName()) &&
                categoryRepository.existsByName(data.name())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria com esse nome já existe.");
        }

        category.setName(data.name());
        Category updatedCategory = categoryRepository.save(category);

        return new CategoryResponseDTO(updatedCategory);
    }

    public Page<CategoryResponseDTO> getAll(Pageable pageable) {
        Page<CategoryResponseDTO> categoryPage = categoryRepository.findAll(pageable)
                .map(CategoryResponseDTO::new);

        return categoryPage;
    }


    public CategoryResponseDTO getById(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada."));

        return new CategoryResponseDTO(category);
    }


    public List<CategoryResponseDTO> getByName(String name) {
        List<CategoryResponseDTO> categoryList = categoryRepository.findByName(name).stream()
                .map(CategoryResponseDTO::new)
                .collect(Collectors.toList());

        return categoryList.isEmpty() ? List.of() : categoryList;
    }

    public ProductDetailedResponseDTO delete(String id) {
        categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        if (!productRepository.findByCategoryId(id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A categoria possuí produtos associados e não pode ser excluída!");
        }

        this.categoryRepository.deleteById(id);
        return null;
    }
}
