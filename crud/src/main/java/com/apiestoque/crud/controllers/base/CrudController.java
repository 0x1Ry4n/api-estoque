package com.apiestoque.crud.controllers.base;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrudController<ID, CreateDTO, UpdateDTO, ResponseDTO> {
    ResponseEntity<ResponseDTO> create(@RequestBody CreateDTO entity);
    
    ResponseEntity<ResponseDTO> update(@PathVariable ID id, @RequestBody UpdateDTO entity);

    ResponseEntity<Page<ResponseDTO>> getAll(Pageable pageable);

    ResponseEntity<?> getById(@PathVariable ID id);

    ResponseEntity<?> delete(@PathVariable ID id);
}
