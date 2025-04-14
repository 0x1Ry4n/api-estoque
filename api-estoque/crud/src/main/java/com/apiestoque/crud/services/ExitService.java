package com.apiestoque.crud.services;

import com.apiestoque.crud.domain.exit.Exit;
import com.apiestoque.crud.domain.exit.dto.ExitRequestDTO;
import com.apiestoque.crud.domain.exit.dto.ExitResponseDTO;
import com.apiestoque.crud.domain.exit.dto.ExitStatus;
import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.repositories.ExitRepository;
import com.apiestoque.crud.repositories.InventoryRepository;
import com.apiestoque.crud.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import jakarta.transaction.Transactional;

@Service
public class ExitService {

    @Autowired
    private ExitRepository exitRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Transactional
    public ExitResponseDTO create(ExitRequestDTO data) {
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

        return new ExitResponseDTO(newExit);
    }

    @Transactional
    public ExitResponseDTO update(String id, ExitRequestDTO data) {
        Exit exit = exitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saída não encontrada!"));

        int quantityDifference;

        if (data.quantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A quantidade de saída deve ser maior que zero!");
        }

        quantityDifference = data.quantity() - exit.getQuantity();
        exit.setQuantity(data.quantity());
        exit.setExitDate(data.exitDate());

        if (quantityDifference != 0) {
            Inventory inventory = inventoryRepository.findByInventoryCode(exit.getInventoryCode())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Não foi encontrado nenhum inventário para o produto!"));

            Product product = inventory.getProduct();

            inventory.setQuantity(inventory.getQuantity() - quantityDifference);
            inventory.setExitQuantity(inventory.getExitQuantity() + quantityDifference);
            inventoryRepository.save(inventory);

            product.setStockQuantity(product.getStockQuantity() - quantityDifference);
            productRepository.save(product);
        }

        exitRepository.save(exit);
        return new ExitResponseDTO(exit);
    }

    @Transactional
    public ExitResponseDTO updateStatus(String id, ExitStatus status) {
        Exit receivement = exitRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saída não encontrada."));

        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status não pode ser nulo.");
        }

        exitRepository.updateExitStatus(receivement.getId(), status.name());

        return new ExitResponseDTO(receivement);
    }

    public ExitResponseDTO getById(String id) {
        Exit exit = exitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saída não encontrada!"));
        return new ExitResponseDTO(exit);
    }

    public Page<ExitResponseDTO> getAll(Pageable pageable) {
        return exitRepository.findAll(pageable).map(ExitResponseDTO::new);
    }

    @Transactional
    public void delete(String id) {
        Exit exit = exitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saída de produto não encontrada."));

        Inventory inventory = inventoryRepository.findByInventoryCode(exit.getInventoryCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventário não encontrado."));

        Product product = productRepository.findById(exit.getProduct().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        inventory.getExits().remove(exit);

        inventory.setQuantity(inventory.getQuantity() + exit.getQuantity());
        inventory.setExitQuantity(inventory.getExitQuantity() - exit.getQuantity());

        product.setStockQuantity(product.getStockQuantity() + exit.getQuantity());

        inventoryRepository.save(inventory);
        productRepository.save(product);
        exitRepository.deleteById(id);
    }
}
