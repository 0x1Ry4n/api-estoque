package com.apiestoque.crud.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.apiestoque.crud.domain.customer.Customer;
import com.apiestoque.crud.domain.customer.dto.CustomerRequestDTO;
import com.apiestoque.crud.domain.customer.dto.CustomerResponseDTO;
import com.apiestoque.crud.domain.customer.dto.CustomerStatus;
import com.apiestoque.crud.infra.exceptions.BadRequestException;
import com.apiestoque.crud.infra.exceptions.NotFoundException;
import com.apiestoque.crud.repositories.CustomerRepository;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;

    @CacheEvict(value = "customers_all", allEntries = true)
    @Transactional
    public CustomerResponseDTO create(CustomerRequestDTO data) {
        if (customerRepository.existsByEmail(data.email())) {
            throw new BadRequestException("Cliente com este e-mail já existe.");
        }

        if (customerRepository.existsByCpf(data.cpf())) {
            throw new BadRequestException("Cliente com este cpf já existe.");
        }

        if (customerRepository.existsByCnpj(data.cnpj())) {
            throw new BadRequestException("Cliente com este cnpj já existe.");
        }

        if (customerRepository.existsByPhone(data.phone())) {
            throw new BadRequestException("Cliente com este telefone já existe.");
        }

        if (customerRepository.existsByMobile(data.mobile())) {
            throw new BadRequestException("Cliente com este telefone celular já existe.");
        }

        Customer newCustomer = new Customer(
                data.name(),
                data.cpf(),
                data.cnpj(),
                data.ie(),
                data.im(),
                data.email(),
                data.phone(),
                data.mobile(),
                data.address(),
                data.number(),
                data.complement(),
                data.neighborhood(),
                data.city(),
                data.state(),
                data.zipCode(),
                data.notes(),
                data.status());

        Customer savedCustomer = customerRepository.save(newCustomer);

        return new CustomerResponseDTO(savedCustomer);
    }

    @Cacheable(value = "customers", key = "#id")
    @Transactional
    public CustomerResponseDTO update(String id, CustomerRequestDTO data) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente não encontrado."));

        if (data.cpf() != null && !customer.getCpf().equals(data.cpf())
                && customerRepository.existsByCpf(data.cpf())) {
            throw new BadRequestException("Cliente com este cpf já existe.");
        }

        if (data.cnpj() != null && !customer.getCnpj().equals(data.cnpj())
                && customerRepository.existsByCnpj(data.cnpj())) {
            throw new BadRequestException("Cliente com este cnpj já existe.");
        }

        if (data.email() != null && !customer.getEmail().equals(data.email())
                && customerRepository.existsByEmail(data.email())) {
            throw new BadRequestException("Cliente com este e-mail já existe.");
        }

        if (data.mobile() != null && !customer.getMobile().equals(data.mobile())
                && customerRepository.existsByMobile(data.mobile())) {
            throw new BadRequestException("Cliente com este telefone celular já existe.");
        }

        if (data.phone() != null && !customer.getPhone().equals(data.phone())
                && customerRepository.existsByPhone(data.phone())) {
            throw new BadRequestException("Cliente com este telefone já existe.");
        }

        if (data.name() != null)
            customer.setName(data.name());
        if (data.cpf() != null)
            customer.setCpf(data.cpf());
        if (data.cnpj() != null)
            customer.setCnpj(data.cnpj());
        if (data.ie() != null)
            customer.setIe(data.ie());
        if (data.im() != null)
            customer.setIm(data.im());
        if (data.address() != null)
            customer.setAddress(data.address());
        if (data.number() != null)
            customer.setNumber(data.number());
        if (data.complement() != null)
            customer.setComplement(data.complement());
        if (data.neighborhood() != null)
            customer.setNeighborhood(data.neighborhood());
        if (data.city() != null)
            customer.setCity(data.city());
        if (data.state() != null)
            customer.setState(data.state());
        if (data.zipCode() != null)
            customer.setZipCode(data.zipCode());
        if (data.status() != null)
            customer.setStatus(data.status());

        Customer updatedCustomer = customerRepository.save(customer);

        return new CustomerResponseDTO(updatedCustomer);
    }

    @CachePut(value = "customers", key = "#id")
    @Transactional
    public CustomerResponseDTO updateStatus(String id, CustomerStatus status) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente não encontrado."));

        if (status == null) {
            throw new BadRequestException("O status não pode ser nulo.");
        }

        customerRepository.UpdateCustomerStatus(customer.getId(), status.name());
        return new CustomerResponseDTO(customer);
    }

    public Page<CustomerResponseDTO> getAll(Pageable pageable) {
        return customerRepository.findAll(pageable)
                .map(CustomerResponseDTO::new);
    }

    @Cacheable(value = "customers_all")
    public List<CustomerResponseDTO> getAll() {
        return customerRepository.findAll()
                .stream()
                .map(CustomerResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "customers", key = "#id")
    public CustomerResponseDTO getById(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente não encontrado."));

        return new CustomerResponseDTO(customer);
    }
}
