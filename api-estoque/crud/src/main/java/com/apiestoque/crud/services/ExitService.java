package com.apiestoque.crud.services;

import com.apiestoque.crud.domain.exit.Exit;
import com.apiestoque.crud.domain.exit.dto.ExitRequestDTO;
import com.apiestoque.crud.domain.exit.dto.ExitResponseDTO;
import com.apiestoque.crud.domain.exit.dto.ExitStatus;
import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.infra.exceptions.BadRequestException;
import com.apiestoque.crud.infra.exceptions.NotFoundException;
import com.apiestoque.crud.repositories.ExitRepository;
import com.apiestoque.crud.repositories.InventoryRepository;
import com.apiestoque.crud.repositories.ProductRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ExitService {
    private final ExitRepository exitRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @CacheEvict(value = "exits_all", allEntries = true)
    @Transactional
    public ExitResponseDTO create(ExitRequestDTO data) {
        Product product = productRepository.findById(data.productId())
                .orElseThrow(() -> new NotFoundException("Produto não encontrado!"));

        Inventory inventory = inventoryRepository.findById(data.inventoryId())
                .orElseThrow(() -> new NotFoundException("Inventário não encontrado para o produto!"));

        if (data.quantity() <= 0) {
            throw new BadRequestException("A quantidade de saída deve ser maior que zero!");
        }

        if (inventory.getQuantity() < data.quantity()) {
            throw new BadRequestException("Estoque insuficiente no inventário!");
        }

        Exit newExit = new Exit(
                product,
                data.quantity(),
                inventory.getInventoryCode(),
                data.exitStatus());
        exitRepository.save(newExit);

        inventory.setQuantity(inventory.getQuantity() - data.quantity());
        inventory.setExitQuantity(inventory.getExitQuantity() + data.quantity());
        inventoryRepository.save(inventory);

        product.setStockQuantity(product.getStockQuantity() - data.quantity());
        productRepository.save(product);

        return new ExitResponseDTO(newExit);
    }

    @CachePut(value = "exits", key = "#id")
    @Transactional
    public ExitResponseDTO update(String id, ExitRequestDTO data) {
        Exit exit = exitRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Saída não encontrada!"));

        int quantityDifference = 0;

        if (exit.getStatus().equals(ExitStatus.COMPLETED)) {
            throw new BadRequestException("A saída não pode ser alterada pois está com status COMPLETADO!");
        }

        if (data.quantity() <= 0) {
            throw new BadRequestException("A quantidade de saída deve ser maior que zero!");
        }

        quantityDifference = data.quantity() - exit.getQuantity();

        exit.setQuantity(data.quantity());

        if (data.exitDate().isAfter(LocalDate.now())) {
            throw new BadRequestException("A data de saída não pode ser no futuro!");
        }

        exit.setExitDate(data.exitDate());

        if (quantityDifference != 0) {
            Inventory inventory = inventoryRepository.findByInventoryCode(exit.getInventoryCode())
                    .orElseThrow(() -> new NotFoundException("Não foi encontrado nenhum inventário para o produto!"));

            Product product = inventory.getProduct();

            int inventoryQuantity = inventory.getQuantity() - quantityDifference;

            if (inventoryQuantity < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estoque insuficiente no inventário!");
            }

            inventory.setQuantity(inventoryQuantity);
            inventory.setExitQuantity(inventory.getExitQuantity() + quantityDifference);
            inventoryRepository.save(inventory);

            product.setStockQuantity(product.getStockQuantity() - quantityDifference);
            productRepository.save(product);
        }

        exitRepository.save(exit);
        return new ExitResponseDTO(exit);
    }

    @CachePut(value = "exits", key = "#id")
    @Transactional
    public ExitResponseDTO updateStatus(String id, ExitStatus status) {
        Exit receivement = exitRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Saída não encontrada!"));

        if (status == null) {
            throw new BadRequestException("O status não pode ser nulo!");
        }

        exitRepository.updateExitStatus(receivement.getId(), status.name());

        return new ExitResponseDTO(receivement);
    }

    @Cacheable(value = "exits", key = "#id")
    public ExitResponseDTO getById(String id) {
        Exit exit = exitRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Saída não encontrada!"));

        return new ExitResponseDTO(exit);
    }

    public Page<ExitResponseDTO> getAll(Pageable pageable) {
        return exitRepository.findAll(pageable).map(ExitResponseDTO::new);
    }

    @Cacheable(value = "exits_all")
    public List<ExitResponseDTO> getAll() {
        return exitRepository.findAll()
                .stream()
                .map(ExitResponseDTO::new)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "exits", key = "#id")
    @Transactional
    public void delete(String id) {
        Exit exit = exitRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Saída não encontrada!"));

        Inventory inventory = inventoryRepository.findByInventoryCode(exit.getInventoryCode())
                .orElseThrow(() -> new NotFoundException("Inventário não encontrado!"));

        Product product = productRepository.findById(exit.getProduct().getId())
                .orElseThrow(() -> new NotFoundException("Produto não encontrado!"));

        inventory.getExits().remove(exit);

        inventory.setQuantity(inventory.getQuantity() + exit.getQuantity());
        inventory.setExitQuantity(inventory.getExitQuantity() - exit.getQuantity());

        product.setStockQuantity(product.getStockQuantity() + exit.getQuantity());

        inventoryRepository.save(inventory);
        productRepository.save(product);
        exitRepository.deleteById(id);
    }
}
