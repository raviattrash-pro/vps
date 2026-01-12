package com.visionpublicschool.controller;

import com.visionpublicschool.entity.GalleryImage;
import com.visionpublicschool.repository.GalleryImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/gallery")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class GalleryController {

    @Autowired
    private GalleryImageRepository galleryImageRepository;

    @Autowired
    private com.visionpublicschool.service.CloudinaryService cloudinaryService;

    @GetMapping
    public List<GalleryImage> getAllImages() {
        return galleryImageRepository.findAllByOrderByUploadDateDesc();
    }

    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public GalleryImage addImage(
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("description") String description) {

        String finalUrl = imageUrl;

        if (file != null && !file.isEmpty()) {
            finalUrl = cloudinaryService.uploadFile(file);
        }

        GalleryImage image = new GalleryImage();
        image.setTitle(title);
        image.setCategory(category);
        image.setDescription(description);
        image.setImageUrl(finalUrl);
        image.setUploadDate(LocalDate.now());

        return galleryImageRepository.save(image);
    }

    @DeleteMapping("/{id}")
    public void deleteImage(@PathVariable Long id) {
        galleryImageRepository.deleteById(id);
    }
}
