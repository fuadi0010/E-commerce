package com.e_commerce.backend.feature_upload.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    private static final Map<String, List<String>> ALLOWED_EXTENSIONS_MAP = Map.of(
            ".jpg", List.of("image/jpeg"),
            ".jpeg", List.of("image/jpeg"),
            ".png", List.of("image/png"),
            ".webp", List.of("image/webp"),
            ".pdf", List.of("application/pdf")
    );

    private final Path fileStorageLocation;

    public FileStorageService() {
        this(Paths.get("uploads").toAbsolutePath().normalize());
    }

    public FileStorageService(Path fileStorageLocation) {
        this.fileStorageLocation = fileStorageLocation.toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Tidak dapat membuat direktori tempat file unggahan akan disimpan.", ex);
        }
    }

    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File tidak boleh kosong");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Ukuran file terlalu besar. Maksimal 5MB.");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.trim().isEmpty()) {
            throw new IllegalArgumentException("Nama file tidak valid.");
        }

        if (originalFileName.contains("..") || originalFileName.contains("/") || originalFileName.contains("\\")) {
            throw new IllegalArgumentException("Nama file mengandung karakter berbahaya (path traversal).");
        }

        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex <= 0 || dotIndex == originalFileName.length() - 1) {
            throw new IllegalArgumentException("File harus memiliki ekstensi yang valid (.jpg, .jpeg, .png, .webp, .pdf).");
        }

        String extension = originalFileName.substring(dotIndex).toLowerCase();
        if (!ALLOWED_EXTENSIONS_MAP.containsKey(extension)) {
            throw new IllegalArgumentException("Tipe file tidak diizinkan. Hanya JPG, PNG, WEBP, dan PDF yang diperbolehkan.");
        }

        String contentType = file.getContentType();
        List<String> allowedMimeTypes = ALLOWED_EXTENSIONS_MAP.get(extension);
        if (contentType == null || !allowedMimeTypes.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Tipe konten (MIME) tidak sesuai dengan ekstensi file.");
        }

        if (!isValidMagicBytes(file, extension)) {
            throw new IllegalArgumentException("Format file tidak valid atau rusak (magic bytes mismatch).");
        }
    }

    public String storeFile(MultipartFile file) {
        validateFile(file);

        String originalFileName = file.getOriginalFilename();
        int dotIndex = originalFileName.lastIndexOf('.');
        String extension = originalFileName.substring(dotIndex).toLowerCase();
        String newFileName = UUID.randomUUID().toString() + extension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(newFileName).normalize();
            if (!targetLocation.startsWith(this.fileStorageLocation)) {
                throw new IllegalArgumentException("Akses lokasi penyimpanan tidak sah.");
            }

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return newFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Gagal menyimpan file " + originalFileName + ". Silakan coba lagi!", ex);
        }
    }

    private boolean isValidMagicBytes(MultipartFile file, String extension) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = is.readNBytes(12);
            if (header.length < 3) {
                return false;
            }

            switch (extension) {
                case ".jpg":
                case ".jpeg":
                    return header.length >= 3 &&
                            (header[0] & 0xFF) == 0xFF &&
                            (header[1] & 0xFF) == 0xD8 &&
                            (header[2] & 0xFF) == 0xFF;

                case ".png":
                    return header.length >= 8 &&
                            (header[0] & 0xFF) == 0x89 &&
                            (header[1] & 0xFF) == 0x50 &&
                            (header[2] & 0xFF) == 0x4E &&
                            (header[3] & 0xFF) == 0x47 &&
                            (header[4] & 0xFF) == 0x0D &&
                            (header[5] & 0xFF) == 0x0A &&
                            (header[6] & 0xFF) == 0x1A &&
                            (header[7] & 0xFF) == 0x0A;

                case ".webp":
                    return header.length >= 12 &&
                            header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F' &&
                            header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P';

                case ".pdf":
                    return header.length >= 4 &&
                            header[0] == '%' && header[1] == 'P' && header[2] == 'D' && header[3] == 'F';

                default:
                    return false;
            }
        } catch (IOException e) {
            return false;
        }
    }
}
