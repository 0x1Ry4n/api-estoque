package com.apiestoque.crud.infra.response;

import org.springframework.http.HttpStatus;

public class ApiResult {
    private ApiResponse body;
    private HttpStatus status;

    public ApiResult(ApiResponse body, HttpStatus status) {
        this.body = body;
        this.status = status;
    }

    public ApiResponse getBody() {
        return body;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
