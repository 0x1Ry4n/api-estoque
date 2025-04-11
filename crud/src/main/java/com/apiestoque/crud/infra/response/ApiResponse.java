package com.apiestoque.crud.infra.response;

import org.springframework.http.HttpStatus;

public class ApiResponse {
    private HttpStatus statusCode;
    private boolean success;
    private String message;
    private String error;

    public ApiResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }

    public ApiResponse(HttpStatus statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
        this.success = true;
    }

    public ApiResponse(HttpStatus statusCode, String error, boolean success) {
        this.statusCode = statusCode;
        this.error = error;
        this.success = success;
    }

    public HttpStatus getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(HttpStatus status) {
        this.statusCode = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
