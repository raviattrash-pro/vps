package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Content;
import com.visionpublicschool.repository.ContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/content")
@CrossOrigin(origins = "*")
public class ContentController {

    @Autowired
    private ContentRepository contentRepository;

    @GetMapping
    public List<Content> getAllContent() {
        return contentRepository.findAll();
    }

    @PostMapping
    public Content createContent(@RequestBody Content content) {
        if (content.getUploadDate() == null) {
            content.setUploadDate(LocalDate.now());
        }
        return contentRepository.save(content);
    }
}
