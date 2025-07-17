package com.apiestoque.crud.services;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.FileNotFoundException;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path rootLocation = Paths.get("uploads");

    public String save(MultipartFile file, String folder) throws IOException {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path destinationFolder = rootLocation.resolve(folder).normalize();

        Files.createDirectories(destinationFolder);

        Path destinationFile = destinationFolder.resolve(fileName);

        Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

        return "/" + rootLocation.relativize(destinationFile).toString().replace("\\", "/");
    }

    public Resource load(String filename, String folder) throws IOException {
        Path filePath = rootLocation.resolve(folder).resolve(filename).normalize();
        if (!Files.exists(filePath)) {
            throw new FileNotFoundException("Arquivo não encontrado: " + filename);
        }
        return new UrlResource(filePath.toUri());
    }
}
