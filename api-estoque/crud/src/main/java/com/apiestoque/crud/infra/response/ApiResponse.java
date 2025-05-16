package com.apiestoque.crud.infra.response;

public class ApiResponse {
    private String key;
    private String message;

    public ApiResponse(String key, String message) {
        this.key = key;
        this.message = message;
    }

    public String getKey() {
        return key;
    }

    public String getMessage() {
        return message;
    }
}
