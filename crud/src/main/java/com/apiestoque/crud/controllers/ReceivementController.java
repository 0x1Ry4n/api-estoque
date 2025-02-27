package com.apiestoque.crud.controllers;

import com.apiestoque.crud.controllers.base.CrudController;
import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.receivement.Receivement;
import com.apiestoque.crud.domain.receivement.dto.ReceivementRequestDTO;
import com.apiestoque.crud.domain.receivement.dto.ReceivementResponseDTO;
import com.apiestoque.crud.domain.supplier.Supplier;
import com.apiestoque.crud.repositories.InventoryRepository;
import com.apiestoque.crud.repositories.ProductRepository;
import com.apiestoque.crud.repositories.ReceivementRepository;
import com.apiestoque.crud.repositories.SupplierRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
    
@RestController
@RequestMapping("/api/receivements")
public class ReceivementController implements CrudController<String, ReceivementRequestDTO, ReceivementRequestDTO, ReceivementResponseDTO> {
    @Autowired
    private ReceivementRepository receivementRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired 
    private SupplierRepository supplierRepository;

    @Override
    @PostMapping
    @Transactional
    public ResponseEntity<ReceivementResponseDTO> create(@RequestBody ReceivementRequestDTO data) {
        Product product = productRepository.findById(data.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado. Insira um produto válido!"));

        Inventory inventory = inventoryRepository.findById(data.inventoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Não foi possível encontrar nenhum inventário para o produto!"));

        Supplier supplier = supplierRepository.findById(data.supplierId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Não foi possível encontrar nenhum fornecedor para o produto!"));

        if (data.quantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A quantidade de recebimento deve ser maior que zero!");
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

        return ResponseEntity.status(HttpStatus.CREATED).body(new ReceivementResponseDTO(receivement));
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<ReceivementResponseDTO> getById(@PathVariable String id) {
        Receivement receivement = receivementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Não foi possível encontrar nenhum recebimento para o produto!"));
        return ResponseEntity.ok(new ReceivementResponseDTO(receivement));
    }

    @Override
    @GetMapping
    public ResponseEntity<Page<ReceivementResponseDTO>> getAll(Pageable pageable) {
        Page<ReceivementResponseDTO> receivementPage = receivementRepository.findAll(pageable)
                .map(ReceivementResponseDTO::new);
   
        return ResponseEntity.ok(receivementPage);
    }

    @Override
    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<ReceivementResponseDTO> update(@PathVariable String id, @RequestBody ReceivementRequestDTO data) {
        Receivement receivement = receivementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Não foi possível encontrar o recebimento!"));

        if (data.quantity() != null && data.quantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A quantidade de recebimento deve ser maior que zero!");
        }

        int quantityDifference = 0;
        if (data.quantity() != null) {
            quantityDifference = data.quantity() - receivement.getQuantity();
            receivement.setQuantity(data.quantity());
        }

        if (data.status() != null) {
            receivement.setStatus(data.status());
        }

        if (data.description() != null) {
            receivement.setDescription(data.description());
        }

        if (quantityDifference != 0) {
            Inventory inventory = inventoryRepository.findByProductId(data.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Não foi encontrado nenhum inventário para o produto!"));

            Product product = inventory.getProduct();

            inventory.setQuantity(inventory.getQuantity() + quantityDifference);
            inventory.setReceivementQuantity(inventory.getReceivementQuantity() + quantityDifference);
            inventoryRepository.save(inventory);

            product.setStockQuantity(product.getStockQuantity() + quantityDifference);
            productRepository.save(product);
        }

        receivementRepository.save(receivement);

        return ResponseEntity.ok(new ReceivementResponseDTO(receivement));
    }


    @Override
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ReceivementResponseDTO> delete(@PathVariable String id) {
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

        this.inventoryRepository.save(inventory);

        this.productRepository.save(product);

        this.receivementRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
