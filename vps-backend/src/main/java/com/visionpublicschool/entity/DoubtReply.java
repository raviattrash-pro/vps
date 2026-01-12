package com.visionpublicschool.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.time.LocalDateTime;

@Entity
@Data
public class DoubtReply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doubt_id")
    @JsonBackReference
    private Doubt doubt;

    private String replierName; // e.g. "Mr. Sharma (Teacher)" or "Amit (Student)"
    private String replierRole; // TEACHER, STUDENT, ADMIN
    private String message;
    private LocalDateTime createdAt;

    // Manual Getters/Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Doubt getDoubt() {
        return doubt;
    }

    public void setDoubt(Doubt doubt) {
        this.doubt = doubt;
    }

    public String getReplierName() {
        return replierName;
    }

    public void setReplierName(String replierName) {
        this.replierName = replierName;
    }

    public String getReplierRole() {
        return replierRole;
    }

    public void setReplierRole(String replierRole) {
        this.replierRole = replierRole;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
