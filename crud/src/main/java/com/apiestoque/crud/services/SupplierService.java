package com.apiestoque.crud.services;

import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.product.dto.ProductResponseDTO;
import com.apiestoque.crud.domain.supplier.Supplier;
import com.apiestoque.crud.domain.supplier.dto.SupplierRequestDTO;
import com.apiestoque.crud.domain.supplier.dto.SupplierResponseDTO;
import com.apiestoque.crud.domain.supplier.dto.SupplierUpdateRequestDTO;
import com.apiestoque.crud.repositories.ProductRepository;
import com.apiestoque.crud.repositories.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SupplierService {
    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductRepository productRepository;

    public SupplierResponseDTO create(SupplierRequestDTO data) {
        if (supplierRepository.existsByEmail(data.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fornecedor com este e-mail já existe.");
        }

        if (supplierRepository.existsByPhone(data.phone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fornecedor com este telefone já existe.");
        }

        if (supplierRepository.existsByCnpj(data.cnpj())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fornecedor com este CNPJ já existe.");
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

    public SupplierResponseDTO update(String id, SupplierUpdateRequestDTO data) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado."));

        if (data.email() != null && !supplier.getEmail().equals(data.email())
                && supplierRepository.existsByEmail(data.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fornecedor com este e-mail já existe.");
        }

        if (data.phone() != null && !supplier.getPhone().equals(data.phone())
                && supplierRepository.existsByPhone(data.phone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fornecedor com este telefone já existe.");
        }

        if (data.socialReason() != null) supplier.setSocialReason(data.socialReason());
        if (data.email() != null) supplier.setEmail(data.email());
        if (data.phone() != null) supplier.setPhone(data.phone());
        if (data.website() != null) supplier.setWebsite(data.website());
        if (data.contactPerson() != null) supplier.setContactPerson(data.contactPerson());
        if (data.cep() != null) supplier.setCep(data.cep());

        Supplier updatedSupplier = supplierRepository.save(supplier);

        return new SupplierResponseDTO(updatedSupplier);
    }

    public Page<SupplierResponseDTO> getAll(Pageable pageable) {
        return supplierRepository.findAll(pageable)
                .map(SupplierResponseDTO::new);
    }

    public SupplierResponseDTO getById(String id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado."));

        return new SupplierResponseDTO(supplier);
    }

    public List<ProductResponseDTO> getProductsBySupplierId(String supplierId) {
        Optional<Supplier> supplier = supplierRepository.findById(supplierId);

        if (supplier.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado.");
        }

        List<Product> products = productRepository.findBySuppliersId(supplierId);

        return products.stream()
                .map(ProductResponseDTO::new)
                .collect(Collectors.toList());
    }

    public void delete(String id) {
        supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado."));

        if (!productRepository.findBySuppliersId(id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O fornecedor possuí produtos associados e não pode ser excluído!");
        }

        supplierRepository.deleteById(id);
    }
}
