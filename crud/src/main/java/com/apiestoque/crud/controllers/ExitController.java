package com.apiestoque.crud.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.apiestoque.crud.controllers.base.CrudController;
import com.apiestoque.crud.domain.exit.Exit;
import com.apiestoque.crud.domain.exit.dto.ExitRequestDTO;
import com.apiestoque.crud.domain.exit.dto.ExitResponseDTO;
import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.repositories.ExitRepository;
import com.apiestoque.crud.repositories.InventoryRepository;
import com.apiestoque.crud.repositories.ProductRepository;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/exits")
public class ExitController implements CrudController<String, ExitRequestDTO, ExitRequestDTO, ExitResponseDTO> {
    @Autowired
    private ExitRepository exitRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Override
    @PostMapping
    @Transactional
    public ResponseEntity<ExitResponseDTO> create(@RequestBody @Validated ExitRequestDTO data) {
        Product product = productRepository.findById(data.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado. Insira um produto válido!"));

        Inventory inventory = inventoryRepository.findById(data.inventoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventário não encontrado para o produto!"));

        if (data.quantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A quantidade de saída deve ser maior que zero!");
        }

        if (inventory.getQuantity() < data.quantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estoque insuficiente no inventário!");
        }

        Exit newExit = new Exit(
            product, 
            data.quantity(), 
            inventory.getInventoryCode(), 
            data.exitStatus()
        );
        exitRepository.save(newExit);

        inventory.setQuantity(inventory.getQuantity() - data.quantity());
        inventory.setExitQuantity(inventory.getExitQuantity() + data.quantity());
        inventoryRepository.save(inventory);

        product.setStockQuantity(product.getStockQuantity() - data.quantity());
        productRepository.save(product);

        return ResponseEntity.status(HttpStatus.CREATED).body(new ExitResponseDTO(newExit));
    }

    @Override
    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<ExitResponseDTO> update(@PathVariable String id, @RequestBody ExitRequestDTO data) {
        Exit exit = exitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saída não encontrada!"));

        int quantityDifference = 0;

        if (data.quantity() != null && data.quantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A quantidade de saída deve ser maior que zero!");
        }

        if (data.quantity() != null) {
            quantityDifference = data.quantity() - exit.getQuantity();
            exit.setQuantity(data.quantity());
        }

        if (data.exitStatus() != null) {
            exit.setStatus(data.exitStatus());
        }

        if (quantityDifference != 0) {
            Inventory inventory = inventoryRepository.findByProductId(data.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Não foi encontrado nenhum inventário para o produto!"));

            Product product = inventory.getProduct();

            inventory.addExit(exit);
            inventoryRepository.save(inventory);

            product.setStockQuantity(product.getStockQuantity() - quantityDifference);
            productRepository.save(product);
        }

        exitRepository.save(exit);

        return ResponseEntity.ok(new ExitResponseDTO(exit));
    }

    @Override
    @GetMapping
    public ResponseEntity<Page<ExitResponseDTO>> getAll(Pageable pageable) {
        Page<ExitResponseDTO> exitPage = exitRepository.findAll(pageable)
                .map(ExitResponseDTO::new);
        return ResponseEntity.ok(exitPage);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<ExitResponseDTO> getById(@PathVariable String id) {
        Exit exit = exitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saída não encontrada!"));
        return ResponseEntity.ok(new ExitResponseDTO(exit));
    }


    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<ExitResponseDTO> delete(@PathVariable String id) {
        exitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saída de produto não encontrada."));

        this.exitRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
