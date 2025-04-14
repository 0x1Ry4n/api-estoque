package com.apiestoque.crud.controllers;

import com.apiestoque.crud.controllers.base.CrudController;
import com.apiestoque.crud.domain.receivement.dto.ReceivementRequestDTO;
import com.apiestoque.crud.domain.receivement.dto.ReceivementResponseDTO;
import com.apiestoque.crud.domain.receivement.dto.ReceivementStatusUpdateDTO;
import com.apiestoque.crud.services.ReceivementService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/receivements")
public class ReceivementController implements CrudController<String, ReceivementRequestDTO, ReceivementRequestDTO, ReceivementResponseDTO> {
    @Autowired
    private ReceivementService receivementService;

    @Override
    @PostMapping
    public ResponseEntity<ReceivementResponseDTO> create(@RequestBody @Validated ReceivementRequestDTO data) {
        ReceivementResponseDTO createdReceivement = receivementService.create(data);
        return ResponseEntity.status(201).body(createdReceivement);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<ReceivementResponseDTO> getById(@PathVariable String id) {
        ReceivementResponseDTO receivement = receivementService.getById(id);
        return ResponseEntity.ok(receivement);
    }

    @Override
    @GetMapping
    public ResponseEntity<Page<ReceivementResponseDTO>> getAll(Pageable pageable) {
        Page<ReceivementResponseDTO> page = receivementService.getAll(pageable);
        return ResponseEntity.ok(page);
    }

    @Override
    @PatchMapping("/{id}")
    public ResponseEntity<ReceivementResponseDTO> update(@PathVariable String id, @RequestBody @Validated ReceivementRequestDTO data) {
        ReceivementResponseDTO updated = receivementService.update(id, data);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ReceivementResponseDTO> updateStatus(
        @PathVariable String id,
        @RequestBody @Valid ReceivementStatusUpdateDTO statusUpdate) {
        
        ReceivementResponseDTO updated = receivementService.updateStatus(id, statusUpdate.status());
        return ResponseEntity.ok(updated);
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        receivementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
