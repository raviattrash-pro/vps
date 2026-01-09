package com.visionpublicschool.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret));
    }

    public String uploadFile(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return null;
            }

            Map<String, Object> params = new HashMap<>();
            String resourceType = "auto";

            // If PDF, force 'raw' and preserve extension in public_id
            if (file.getContentType() != null && file.getContentType().toLowerCase().contains("pdf")) {
                resourceType = "raw";
                String originalName = file.getOriginalFilename();
                if (originalName == null)
                    originalName = "document.pdf";

                // Sanitize filename to be URL safe
                String cleanName = originalName.replaceAll("[^a-zA-Z0-9.-]", "_");
                // Prepend timestamp to ensure uniqueness
                String publicId = System.currentTimeMillis() + "_" + cleanName;

                params.put("public_id", publicId);
            }

            params.put("resource_type", resourceType);

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("File upload failed: " + e.getMessage());
        }
    }

    public String uploadFile(MultipartFile file, String publicId) {
        try {
            if (file == null || file.isEmpty())
                return null;

            String resourceType = "auto";
            if (file.getContentType() != null && file.getContentType().toLowerCase().contains("pdf")) {
                resourceType = "raw";
            }

            Map params = ObjectUtils.asMap(
                    "public_id", publicId,
                    "overwrite", true,
                    "resource_type", resourceType);

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Upload failed: " + e.getMessage());
        }
    }

    public String getUrl(String publicId) {
        return cloudinary.url().generate(publicId);
    }
}
