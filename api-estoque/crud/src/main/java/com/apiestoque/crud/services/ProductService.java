package com.apiestoque.crud.services;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
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
import com.apiestoque.crud.infra.exceptions.BadRequestException;
import com.apiestoque.crud.infra.exceptions.InternalErrorException;
import com.apiestoque.crud.infra.exceptions.NotFoundException;
import com.apiestoque.crud.repositories.CategoryRepository;
import com.apiestoque.crud.repositories.ExitRepository;
import com.apiestoque.crud.repositories.InventoryRepository;
import com.apiestoque.crud.repositories.ProductRepository;
import com.apiestoque.crud.repositories.ReceivementRepository;
import com.apiestoque.crud.repositories.SupplierRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final SupplierRepository supplierRepository;
    private final ReceivementRepository receivementRepository;
    private final ExitRepository exitRepository;
    private final FileStorageService fileStorageService;

    @CacheEvict(value = "products_all", allEntries = true)
    @Transactional
    public ProductResponseDTO create(ProductRequestDTO data) {
        Category category = categoryRepository.findById(data.categoryId())
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada!"));

        Set<Supplier> suppliers = data.suppliersId().stream()
                .map(supplierId -> supplierRepository.findById(supplierId)
                        .orElseThrow(() -> new NotFoundException("Fornecedor não encontrado com ID: " + supplierId)))
                .collect(Collectors.toSet());

        if (productRepository.existsByProductCode(data.productCode())) {
            throw new BadRequestException("Produto com esse código já existe!");
        }

        Product newProduct = new Product(
                data.name(),
                data.description(),
                data.productCode(),
                data.unitPrice(),
                category,
                suppliers,
                data.expirationDate());

        if (data.file() != null) {
            try {
                String imagePath = fileStorageService.save(data.file(), "produtos");
                newProduct.setImagePath(imagePath);
            } catch (IOException ex) {
                throw new InternalErrorException("Erro ao salvar a imagem: " + ex.getMessage());
            }
        }

        Product savedProduct = this.productRepository.save(newProduct);

        return new ProductResponseDTO(savedProduct);
    }

    @CachePut(value = "products", key = "#id")
    @Transactional
    public ProductResponseDTO update(String id, ProductUpdateDTO data) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Produto não encontrado!"));

        if (!data.supplierIds().isEmpty()) {
            Set<Supplier> suppliers = data.supplierIds().stream()
                    .map(supplierId -> supplierRepository.findById(supplierId)
                            .orElseThrow(() -> new NotFoundException("Fornecedor não encontrado com ID: " + supplierId)))
                    .collect(Collectors.toSet());

            product.setSuppliers(suppliers);
        }

        if (data.name() != null) {
            product.setName(data.name());
        }

        if (data.categoryId() != null) {
            Category category = categoryRepository.findById(data.categoryId())
                    .orElseThrow(() -> new NotFoundException("Categoria não encontrada!"));

            product.setCategory(category);
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

    @CachePut(value = "products", key = "#id")
    @Transactional
    public ProductResponseDTO updateImage(String id, MultipartFile file) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Produto não encontrado!"));

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Insira uma imagem!");
        }

        try {
            String imagePath = fileStorageService.save(file, "produtos");
            product.setImagePath(imagePath);
            productRepository.save(product);
            return new ProductResponseDTO(product);
        } catch (IOException ex) {
            throw new InternalErrorException("Erro ao salvar a imagem: " + ex.getMessage());
        }
    }

    public Resource getImage(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Produto não encontrado!"));

        String imagePath = product.getImagePath();
        if (imagePath == null) {
            throw new NotFoundException("O produto não possui imagem registrada!");
        }

        try {
            String fileName = Paths.get(imagePath).getFileName().toString();
            Resource resource = fileStorageService.load(fileName, "produtos");

            if (resource == null || !resource.exists()) {
                throw new NotFoundException("Imagem do produto não encontrada!");
            }

            return resource;
        } catch (Exception ex) {
            throw new InternalErrorException("Erro ao obter a imagem: " + ex.getMessage());
        }
    }

    public Page<ProductResponseDTO> getAll(Pageable pageable) {
        Page<ProductResponseDTO> productPage = productRepository.findAll(pageable)
                .map(ProductResponseDTO::new);
        return productPage;
    }

    @Cacheable(value = "products_all")
    public List<ProductResponseDTO> getAll() {
        return productRepository.findAll()
                .stream()
                .map(ProductResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "products_detailed", key = "#id")
    public ProductDetailedResponseDTO getById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Produto não encontrado!"));

        return new ProductDetailedResponseDTO(product);
    }

    @Cacheable(value = "products", key = "#name")
    public List<ProductResponseDTO> getProductByName(String name) {
        List<Product> products = productRepository.findByName(name);
        List<ProductResponseDTO> productList = products.stream()
                .map(ProductResponseDTO::new)
                .collect(Collectors.toList());

        return productList.isEmpty() ? List.of() : productList;
    }

    @CacheEvict(value = "products", key = "#id")
    @Transactional
    public void delete(String id) {
        productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Produto não encontrado!"));

        if (inventoryRepository.findByProductId(id).isPresent()) {
            throw new BadRequestException("O produto possui inventários associados e não pode ser excluído!");
        }

        this.productRepository.deleteById(id);
    }

    @CacheEvict(value = "inventories_all", allEntries = true)
    @Transactional
    public InventoryResponseDTO createInventory(String productId, InventoryRequestDTO data) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Produto não encontrado!"));

        if (inventoryRepository.existsByInventoryCode(data.inventoryCode())) {
            throw new BadRequestException("Inventário com esse código já existe!");
        }

        Inventory inventory = new Inventory(
                product,
                data.discount(),
                data.inventoryCode());

        Inventory savedInventory = inventoryRepository.save(inventory);

        return new InventoryResponseDTO(savedInventory);
    }

    public Page<InventoryResponseDTO> getAllInventories(Pageable pageable) {
        Page<InventoryResponseDTO> productPage = inventoryRepository.findAll(pageable)
                .map(InventoryResponseDTO::new);

        return productPage;
    }

    @Cacheable(value = "inventories", key = "#id")
    public List<InventoryResponseDTO> getInventoryById(String id) {
        List<Inventory> inventories = inventoryRepository.findAllByProductId(id);

        if (inventories.isEmpty()) {
            throw new NotFoundException("Não foi possível encontrar nenhum inventário para o produto!");
        }

        List<InventoryResponseDTO> inventoryResponseDTO = inventories.stream()
                .map(InventoryResponseDTO::new)
                .collect(Collectors.toList());

        return inventoryResponseDTO;
    }

    @CacheEvict(value = "inventories", key = "#inventoryId")
    @Transactional
    public void deleteInventory(String productId, String inventoryId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Não foi possível encontrar o produto selecionado!"));

        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new NotFoundException("Não foi possível encontrar o inventário selecionado!"));

        if (receivementRepository.existsByInventoryCode(inventory.getInventoryCode())) {
            throw new BadRequestException("O inventário possui recebimentos associados e não pode ser excluído!");
        }

        if (exitRepository.existsByInventoryCode(inventory.getInventoryCode())) {
            throw new BadRequestException("O inventário possui saídas associadas e não pode ser excluído!");
        }

        inventoryRepository.deleteById(inventoryId);
    }
}
