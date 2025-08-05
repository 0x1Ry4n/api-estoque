package com.apiestoque.crud.services;

import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.product.dto.ProductResponseDTO;
import com.apiestoque.crud.domain.supplier.Supplier;
import com.apiestoque.crud.domain.supplier.dto.SupplierRequestDTO;
import com.apiestoque.crud.domain.supplier.dto.SupplierResponseDTO;
import com.apiestoque.crud.domain.supplier.dto.SupplierUpdateRequestDTO;
import com.apiestoque.crud.infra.exceptions.BadRequestException;
import com.apiestoque.crud.infra.exceptions.NotFoundException;
import com.apiestoque.crud.repositories.ProductRepository;
import com.apiestoque.crud.repositories.SupplierRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class SupplierService {
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    @CacheEvict(value = "suppliers_all", allEntries = true)
    @Transactional
    public SupplierResponseDTO create(SupplierRequestDTO data) {
        if (supplierRepository.existsByEmail(data.email())) {
            throw new BadRequestException("Fornecedor com este e-mail já existe!");
        }

        if (supplierRepository.existsByPhone(data.phone())) {
            throw new BadRequestException("Fornecedor com este telefone já existe!");
        }

        if (supplierRepository.existsByCnpj(data.cnpj())) {
            throw new BadRequestException("Fornecedor com este CNPJ já existe.");
        }

        Supplier newSupplier = new Supplier(
                data.socialReason(),
                data.email(),
                data.phone(),
                data.cnpj(),
                data.website(),
                data.contactPerson(),
                data.cep(),
                data.communicationPreference());

        Supplier savedSupplier = supplierRepository.save(newSupplier);

        return new SupplierResponseDTO(savedSupplier);
    }

    @Cacheable(value = "suppliers", key = "#id")
    @Transactional
    public SupplierResponseDTO update(String id, SupplierUpdateRequestDTO data) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Fornecedor não encontrado!"));

        if (data.email() != null && !supplier.getEmail().equals(data.email())
                && supplierRepository.existsByEmail(data.email())) {
            throw new BadRequestException("Fornecedor com este e-mail já existe.");
        }

        if (data.phone() != null && !supplier.getPhone().equals(data.phone())
                && supplierRepository.existsByPhone(data.phone())) {
            throw new BadRequestException("Fornecedor com este telefone já existe.");
        }

        if (data.socialReason() != null) 
            supplier.setSocialReason(data.socialReason());
        if (data.email() != null)
            supplier.setEmail(data.email());
        if (data.phone() != null)
            supplier.setPhone(data.phone());
        if (data.website() != null)
            supplier.setWebsite(data.website());
        if (data.contactPerson() != null)
            supplier.setContactPerson(data.contactPerson());
        if (data.cep() != null)
            supplier.setCep(data.cep());
        if (data.communicationPreference() != null)
            supplier.setCommunicationPreference(data.communicationPreference());

        Supplier updatedSupplier = supplierRepository.save(supplier);
        return new SupplierResponseDTO(updatedSupplier);
    }

    public Page<SupplierResponseDTO> getAll(Pageable pageable) {
        return supplierRepository.findAll(pageable)
                .map(SupplierResponseDTO::new);
    }

    @Cacheable(value = "suppliers_all")
    public List<SupplierResponseDTO> getAll() {
        return supplierRepository.findAll()
                .stream()
                .map(SupplierResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "suppliers", key = "#id")
    public SupplierResponseDTO getById(String id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Fornecedor não encontrado!"));

        return new SupplierResponseDTO(supplier);
    }

    @Cacheable(value = "supplier_products", key = "#supplierId")
    public List<ProductResponseDTO> getProductsBySupplierId(String supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new NotFoundException("Fornecedor não encontrado!"));

        List<Product> products = productRepository.findBySuppliersId(supplier.getId());

        return products.stream()
                .map(ProductResponseDTO::new)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "suppliers", key = "#id")
    @Transactional
    public void delete(String id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Fornecedor não encontrado!"));

        if (!productRepository.findBySuppliersId(supplier.getId()).isEmpty()) {
            throw new BadRequestException("O fornecedor possuí produtos associados e não pode ser excluído!");
        }

        supplierRepository.deleteById(id);
    }
}
