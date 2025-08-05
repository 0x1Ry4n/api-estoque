package com.apiestoque.crud.services;

import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.receivement.Receivement;
import com.apiestoque.crud.domain.receivement.dto.ReceivementRequestDTO;
import com.apiestoque.crud.domain.receivement.dto.ReceivementResponseDTO;
import com.apiestoque.crud.domain.receivement.dto.ReceivementStatus;
import com.apiestoque.crud.domain.supplier.Supplier;
import com.apiestoque.crud.infra.exceptions.BadRequestException;
import com.apiestoque.crud.infra.exceptions.NotFoundException;
import com.apiestoque.crud.repositories.InventoryRepository;
import com.apiestoque.crud.repositories.ProductRepository;
import com.apiestoque.crud.repositories.ReceivementRepository;
import com.apiestoque.crud.repositories.SupplierRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ReceivementService {
    private final ReceivementRepository receivementRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final SupplierRepository supplierRepository;

    @CacheEvict(value = "receivements_all", allEntries = true)
    @Transactional
    public ReceivementResponseDTO create(ReceivementRequestDTO data) {
        Product product = productRepository.findById(data.productId())
                .orElseThrow(() -> new NotFoundException("Produto não encontrado!"));

        Inventory inventory = inventoryRepository.findById(data.inventoryId())
                .orElseThrow(() -> new NotFoundException("Inventário não encontrado!"));

        Supplier supplier = supplierRepository.findById(data.supplierId())
                .orElseThrow(() -> new NotFoundException("Fornecedor não encontrado!"));

        if (data.quantity() <= 0) {
            throw new BadRequestException("A quantidade de entrada deve ser maior que zero!");
        }

        if (data.receivingDate().isAfter(LocalDate.now())) {
            throw new BadRequestException("A data de recebimento não pode ser no futuro!");
        }

        BigDecimal totalPrice = inventory.getProduct().getUnitPrice().multiply(BigDecimal.valueOf(data.quantity()));

        Receivement receivement = new Receivement(
                product,
                supplier,
                inventory.getInventoryCode(),
                data.description(),
                data.quantity(),
                totalPrice,
                data.receivingDate(),
                data.status()
        );

        receivementRepository.save(receivement);
        inventory.addReceivement(receivement);
        inventoryRepository.save(inventory);

        product.setStockQuantity(product.getStockQuantity() + data.quantity());
        productRepository.save(product);

        return new ReceivementResponseDTO(receivement);
    }

    @Cacheable(value = "receivements", key = "#id")
    public ReceivementResponseDTO getById(String id) {
        Receivement receivement = receivementRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Recebimento não encontrado!"));
        return new ReceivementResponseDTO(receivement);
    }

    public Page<ReceivementResponseDTO> getAll(Pageable pageable) {
        return receivementRepository.findAll(pageable).map(ReceivementResponseDTO::new);
    }

    @Cacheable(value = "receivements_all")
    public List<ReceivementResponseDTO> getAll() {
        return receivementRepository.findAll().
                stream().
                map(ReceivementResponseDTO::new).
                collect(Collectors.toList());
    } 

    @CachePut(value = "receivements", key = "#id")
    @Transactional
    public ReceivementResponseDTO update(String id, ReceivementRequestDTO data) {
        Receivement receivement = receivementRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Recebimento não encontrado!"));

        int quantityDifference = 0;

        if (data.status() != null && !receivement.getStatus().equals(ReceivementStatus.COMPLETED)) {
            receivement.setStatus(data.status());
        } else {
            throw new BadRequestException("O recebimento não pode ser alterado pois está com status COMPLETADO!");
        }

        if (data.description() != null) 
            receivement.setDescription(data.description());

        if (data.receivingDate() != null && !data.receivingDate().isAfter(LocalDate.now())) { 
            receivement.setReceivingDate(data.receivingDate());
        } else {  
            throw new BadRequestException("A data de recebimento não pode ser no futuro!");
        }

        if (data.quantity() <= 0) {
            throw new BadRequestException("A quantidade de entrada deve ser maior que zero!");
        }

        quantityDifference = data.quantity() - receivement.getQuantity();
        receivement.setQuantity(data.quantity());
        
        if (quantityDifference != 0) {
            Inventory inventory = inventoryRepository.findByInventoryCode(receivement.getInventoryCode())
                    .orElseThrow(() -> new NotFoundException("Inventário não encontrado!"));

            Product product = inventory.getProduct();

            inventory.setQuantity(inventory.getQuantity() + quantityDifference);
            inventory.setReceivementQuantity(inventory.getReceivementQuantity() + quantityDifference);
            inventoryRepository.save(inventory);

            product.setStockQuantity(product.getStockQuantity() + quantityDifference);
            productRepository.save(product);
        }

        receivementRepository.save(receivement);
        return new ReceivementResponseDTO(receivement);
    }
    
    @CachePut(value = "receivements", key = "#id")
    @Transactional
    public ReceivementResponseDTO updateStatus(String id, ReceivementStatus status) {
        Receivement receivement = receivementRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Recebimento não encontrado!"));

        if (status != null) {
            receivementRepository.updateReceivementStatus(receivement.getId(), status.name());
        }

        return new ReceivementResponseDTO(receivement);
    }

    @CacheEvict(value = "receivements", key = "#id")
    @Transactional
    public void delete(String id) {
        Receivement receivement = receivementRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Recebimento não encontrado!"));

        Inventory inventory = inventoryRepository.findByInventoryCode(receivement.getInventoryCode())
                .orElseThrow(() -> new NotFoundException("Inventário não encontrado!"));

        Product product = productRepository.findById(receivement.getProduct().getId())
                .orElseThrow(() -> new NotFoundException("Produto não encontrado!"));

        inventory.getReceivements().remove(receivement);
        inventory.setQuantity(inventory.getQuantity() - receivement.getQuantity());
        inventory.setReceivementQuantity(inventory.getReceivementQuantity() - receivement.getQuantity());
        product.setStockQuantity(product.getStockQuantity() - receivement.getQuantity());

        inventoryRepository.save(inventory);
        productRepository.save(product);
        receivementRepository.deleteById(id);
    }
}
