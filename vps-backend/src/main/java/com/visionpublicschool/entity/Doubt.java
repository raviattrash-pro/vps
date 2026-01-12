package com.visionpublicschool.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Doubt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    private String subject;
    private String question;
    private LocalDateTime createdAt;

    // Status can be "OPEN", "RESOLVED"
    private String status;

    @OneToMany(mappedBy = "doubt", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<DoubtReply> replies = new ArrayList<>();

    // Manual Getters/Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<DoubtReply> getReplies() {
        return replies;
    }

    public void setReplies(List<DoubtReply> replies) {
        this.replies = replies;
    }
}
