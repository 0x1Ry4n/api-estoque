package com.apiestoque.crud.controllers;

import com.apiestoque.crud.controllers.base.CrudController;
import com.apiestoque.crud.domain.exit.dto.ExitRequestDTO;
import com.apiestoque.crud.domain.exit.dto.ExitResponseDTO;
import com.apiestoque.crud.domain.exit.dto.ExitStatusUpdateDTO;     
import com.apiestoque.crud.services.ExitService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exits")
public class ExitController implements CrudController<String, ExitRequestDTO, ExitRequestDTO, ExitResponseDTO> {

    @Autowired
    private ExitService exitService;

    @Override
    @PostMapping
    public ResponseEntity<ExitResponseDTO> create(@RequestBody @Validated ExitRequestDTO data) {
        ExitResponseDTO response = exitService.create(data);
        return ResponseEntity.status(201).body(response);
    }

    @Override
    @PatchMapping("/{id}")
    public ResponseEntity<ExitResponseDTO> update(@PathVariable String id, @RequestBody ExitRequestDTO data) {
        ExitResponseDTO response = exitService.update(id, data);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ExitResponseDTO> updateStatus(
        @PathVariable String id,
        @RequestBody @Valid ExitStatusUpdateDTO statusUpdate) {
        
        ExitResponseDTO updated = exitService.updateStatus(id, statusUpdate.status());
        return ResponseEntity.ok(updated);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<ExitResponseDTO> getById(@PathVariable String id) {
        ExitResponseDTO response = exitService.getById(id);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping
    public ResponseEntity<Page<ExitResponseDTO>> getAll(Pageable pageable) {
        Page<ExitResponseDTO> responsePage = exitService.getAll(pageable);
        return ResponseEntity.ok(responsePage);
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        exitService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
