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
import com.apiestoque.crud.controllers.base.CrudController;
import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.domain.inventory.dto.InventoryRequestDTO;
import com.apiestoque.crud.domain.inventory.dto.InventoryResponseDTO;
import com.apiestoque.crud.repositories.CategoryRepository;
import com.apiestoque.crud.repositories.ExitRepository;
import com.apiestoque.crud.repositories.ProductRepository;
import com.apiestoque.crud.repositories.ReceivementRepository;
import com.apiestoque.crud.repositories.SupplierRepository;
import com.apiestoque.crud.repositories.InventoryRepository;
import com.apiestoque.crud.domain.supplier.Supplier;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Set;

@RestController
@RequestMapping("/api/products")
public class ProductController implements CrudController<String, ProductRequestDTO, ProductUpdateDTO, ProductResponseDTO>{
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ReceivementRepository receivementRepository;

    @Autowired
    private ExitRepository exitRepository;

    @Override
    @PostMapping
    public ResponseEntity<ProductResponseDTO> create(@RequestBody @Validated ProductRequestDTO data) {
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


    @Override
    @PatchMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> update(@PathVariable String id,
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

    @Override
    @GetMapping
    public ResponseEntity<Page<ProductResponseDTO>> getAll(Pageable pageable) {
        Page<ProductResponseDTO> productPage = productRepository.findAll(pageable)
                .map(ProductResponseDTO::new);
        return ResponseEntity.ok(productPage);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailedResponseDTO> getById(@PathVariable String id) {
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

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<ProductDetailedResponseDTO> delete(@PathVariable String id) {
        productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        if (inventoryRepository.findByProductId(id).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O produto possui inventários associados e não pode ser excluído!");
        }


        this.productRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    // ---- Inventory controller ---- 

    @PostMapping("/{productId}/inventory")
    public ResponseEntity<InventoryResponseDTO> createInventory(@PathVariable String productId,
            @RequestBody @Validated InventoryRequestDTO data) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Não foi possível encontrar o produto. Insira um produto válido!"));

        Inventory inventory = new Inventory(
            product,
            data.discount(),
            data.inventoryCode() 
        );

        Inventory savedInventory = inventoryRepository.save(inventory);

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
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Não foi possível encontrar nenhum inventário para o produto!");
        }
    
        List<InventoryResponseDTO> inventoryResponseDTOs = inventories.stream()
                .map(InventoryResponseDTO::new) 
                .collect(Collectors.toList());
    
        return ResponseEntity.ok(inventoryResponseDTOs);
    }

    @DeleteMapping("/{productId}/inventory/{inventoryId}")
    public ResponseEntity<Void> deleteInventory(@PathVariable String productId, @PathVariable String inventoryId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Não foi possível encontrar o produto selecionado!"));

        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Não foi possível encontrar o inventário selecionado!"));

        boolean hasReceivements = receivementRepository.existsByInventoryCode(inventory.getInventoryCode());
        if (hasReceivements) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O inventário possui recebimentos associados e não pode ser excluído!");
        }

        boolean hasExits = exitRepository.existsByInventoryCode(inventory.getInventoryCode());
        if (hasExits) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O inventário possui saídas associadas e não pode ser excluído!");
        }

        inventoryRepository.deleteById(inventoryId);

        return ResponseEntity.noContent().build();
    }
}
