package com.apiestoque.crud.services;

import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.receivement.Receivement;
import com.apiestoque.crud.domain.receivement.dto.ReceivementRequestDTO;
import com.apiestoque.crud.domain.receivement.dto.ReceivementResponseDTO;
import com.apiestoque.crud.domain.receivement.dto.ReceivementStatus;
import com.apiestoque.crud.domain.supplier.Supplier;
import com.apiestoque.crud.repositories.InventoryRepository;
import com.apiestoque.crud.repositories.ProductRepository;
import com.apiestoque.crud.repositories.ReceivementRepository;
import com.apiestoque.crud.repositories.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import jakarta.transaction.Transactional;


@Service
public class ReceivementService {

    @Autowired
    private ReceivementRepository receivementRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Transactional
    public ReceivementResponseDTO create(ReceivementRequestDTO data) {
        Product product = productRepository.findById(data.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        Inventory inventory = inventoryRepository.findById(data.inventoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventário não encontrado."));

        Supplier supplier = supplierRepository.findById(data.supplierId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado."));

        if (data.quantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantidade deve ser maior que zero.");
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

    public ReceivementResponseDTO getById(String id) {
        Receivement receivement = receivementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recebimento não encontrado."));
        return new ReceivementResponseDTO(receivement);
    }

    public Page<ReceivementResponseDTO> getAll(Pageable pageable) {
        return receivementRepository.findAll(pageable).map(ReceivementResponseDTO::new);
    }

    @Transactional
    public ReceivementResponseDTO update(String id, ReceivementRequestDTO data) {
        Receivement receivement = receivementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recebimento não encontrado."));

        int quantityDifference = 0;
        if (data.quantity() > 0) {
            quantityDifference = data.quantity() - receivement.getQuantity();
            receivement.setQuantity(data.quantity());
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantidade deve ser maior que zero.");
        }

        receivement.setStatus(data.status());
        receivement.setReceivingDate(data.receivingDate());
        
        if (data.description() != null) receivement.setDescription(data.description());

        if (quantityDifference != 0) {
            Inventory inventory = inventoryRepository.findByInventoryCode(receivement.getInventoryCode())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventário não encontrado."));

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
    
    @Transactional
    public ReceivementResponseDTO updateStatus(String id, ReceivementStatus status) {
        Receivement receivement = receivementRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recebimento não encontrado."));

        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status não pode ser nulo.");
        }

        receivementRepository.updateReceivementStatus(receivement.getId(), status.name());

        return new ReceivementResponseDTO(receivement);
    }

    @Transactional
    public void delete(String id) {
        Receivement receivement = receivementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recebimento não encontrado."));

        Inventory inventory = inventoryRepository.findByInventoryCode(receivement.getInventoryCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventário não encontrado."));

        Product product = productRepository.findById(receivement.getProduct().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        inventory.getReceivements().remove(receivement);
        inventory.setQuantity(inventory.getQuantity() - receivement.getQuantity());
        inventory.setReceivementQuantity(inventory.getReceivementQuantity() - receivement.getQuantity());
        product.setStockQuantity(product.getStockQuantity() - receivement.getQuantity());

        inventoryRepository.save(inventory);
        productRepository.save(product);
        receivementRepository.deleteById(id);
    }
}
