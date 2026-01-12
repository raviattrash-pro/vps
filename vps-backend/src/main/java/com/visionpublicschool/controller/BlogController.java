package com.visionpublicschool.controller;

import com.visionpublicschool.entity.BlogPost;
import com.visionpublicschool.entity.Student;
import com.visionpublicschool.repository.BlogPostRepository;
import com.visionpublicschool.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/blog")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class BlogController {

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public List<BlogPost> getPublishedPosts() {
        return blogPostRepository.findByIsPublishedTrueOrderByPublishDateDesc();
    }

    // Admin view could use findAll()

    @PostMapping
    public BlogPost createPost(@RequestBody BlogPost post) {
        if (post.getAuthor() != null && post.getAuthor().getId() != null) {
            Student author = studentRepository.findById(post.getAuthor().getId()).orElseThrow();
            post.setAuthor(author);
        }
        post.setPublishDate(LocalDateTime.now());
        post.setLikes(0);
        post.setPublished(true); // Auto-publish for now, later Admin moderation
        return blogPostRepository.save(post);
    }

    @PostMapping("/{id}/like")
    public BlogPost likePost(@PathVariable Long id) {
        BlogPost post = blogPostRepository.findById(id).orElseThrow();
        post.setLikes(post.getLikes() + 1);
        return blogPostRepository.save(post);
    }
}
