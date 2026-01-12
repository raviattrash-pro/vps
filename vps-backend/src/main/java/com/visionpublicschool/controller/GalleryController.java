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

    @GetMapping
    public List<GalleryImage> getAllImages() {
        return galleryImageRepository.findAllByOrderByUploadDateDesc();
    }

    @PostMapping
    public GalleryImage addImage(@RequestBody GalleryImage image) {
        image.setUploadDate(LocalDate.now());
        return galleryImageRepository.save(image);
    }
}
