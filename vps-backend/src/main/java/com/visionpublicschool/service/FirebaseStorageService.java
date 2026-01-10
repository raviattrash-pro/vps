package com.visionpublicschool.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class FirebaseStorageService {

    @Value("${firebase.config.path}")
    private String firebaseConfigPath;

    @Value("${firebase.bucket.name}")
    private String bucketName;

    private Storage storage;

    private void init() throws IOException {
        if (this.storage == null) {
            GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(firebaseConfigPath));
            this.storage = StorageOptions.newBuilder().setCredentials(credentials).build().getService();
        }
    }

    public String uploadFile(MultipartFile file) {
        try {
            init();
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Bucket bucket = storage.get(bucketName);

            // Upload file
            Blob blob = bucket.create(fileName, file.getBytes(), file.getContentType());

            // Generate public URL (assuming bucket is publicly readable or using signed
            // URLs - here simplified)
            // Ideally, for public access, we might need to set ACLs or use a signed URL.
            // For this simpler implementation, we'll construct the specialized media URL
            // often used with Firebase Storage

            // Format:
            // https://firebasestorage.googleapis.com/v0/b/<bucket-name>/o/<object-name>?alt=media
            return String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                    bucketName,
                    URLEncoder.encode(fileName, StandardCharsets.UTF_8));

        } catch (IOException e) {
            throw new RuntimeException("Firebase upload failed: " + e.getMessage());
        }
    }
}
