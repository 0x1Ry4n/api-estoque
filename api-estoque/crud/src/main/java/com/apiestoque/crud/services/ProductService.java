package com.apiestoque.crud.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.domain.inventory.dto.InventoryRequestDTO;
import com.apiestoque.crud.domain.inventory.dto.InventoryResponseDTO;
import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.product.category.Category;
import com.apiestoque.crud.domain.product.dto.ProductDetailedResponseDTO;
import com.apiestoque.crud.domain.product.dto.ProductRequestDTO;
import com.apiestoque.crud.domain.product.dto.ProductResponseDTO;
import com.apiestoque.crud.domain.product.dto.ProductUpdateDTO;
import com.apiestoque.crud.domain.supplier.Supplier;
import com.apiestoque.crud.repositories.CategoryRepository;
import com.apiestoque.crud.repositories.ExitRepository;
import com.apiestoque.crud.repositories.InventoryRepository;
import com.apiestoque.crud.repositories.ProductRepository;
import com.apiestoque.crud.repositories.ReceivementRepository;
import com.apiestoque.crud.repositories.SupplierRepository;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductService {
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

    public ProductResponseDTO create(ProductRequestDTO data) {
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
                data.productCode(),
                data.unitPrice(),
                category,
                suppliers,
                data.expirationDate());

        Product savedProduct = this.productRepository.save(newProduct);

        return new ProductResponseDTO(savedProduct);
    }

    public ProductResponseDTO update(String id, ProductUpdateDTO data) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        if (data.productCode() != null) {
            product.setProductCode(data.productCode());
        }

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
        return new ProductResponseDTO(updatedProduct);
    }

    public Page<ProductResponseDTO> getAll(Pageable pageable) {
        Page<ProductResponseDTO> productPage = productRepository.findAll(pageable)
                .map(ProductResponseDTO::new);
        return productPage;
    }

    public ProductDetailedResponseDTO getById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));
        
        return new ProductDetailedResponseDTO(product);
    }

    public List<ProductResponseDTO> getProductByName(String name) {
        List<Product> products = productRepository.findByName(name);
        List<ProductResponseDTO> productList = products.stream()
                .map(ProductResponseDTO::new)
                .collect(Collectors.toList());

        return productList.isEmpty() ? List.of() : productList;
    }

    public ProductDetailedResponseDTO delete(String id) {
        productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        if (inventoryRepository.findByProductId(id).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O produto possui inventários associados e não pode ser excluído!");
        }

        this.productRepository.deleteById(id);

        return null;
    }

    // ---- Inventory controller ---- 

    public InventoryResponseDTO createInventory(String productId, InventoryRequestDTO data) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Não foi possível encontrar o produto. Insira um produto válido!"));

        Inventory inventory = new Inventory(
            product,
            data.discount(),
            data.inventoryCode() 
        );

        Inventory savedInventory = inventoryRepository.save(inventory);

        return new InventoryResponseDTO(savedInventory);
    }


    public Page<InventoryResponseDTO> getAllInventories(Pageable pageable) {
        Page<InventoryResponseDTO> productPage = inventoryRepository.findAll(pageable)
                .map(InventoryResponseDTO::new);

        return productPage;
    }

    public List<InventoryResponseDTO> getInventoryById(String id) {
        List<Inventory> inventories = inventoryRepository.findAllByProductId(id);
        
        if (inventories.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Não foi possível encontrar nenhum inventário para o produto!");
        }
    
        List<InventoryResponseDTO> inventoryResponseDTO = inventories.stream()
                .map(InventoryResponseDTO::new) 
                .collect(Collectors.toList());
    
        return inventoryResponseDTO;
    }

    public Void deleteInventory(String productId, String inventoryId) {
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

        return null;
    }
}
