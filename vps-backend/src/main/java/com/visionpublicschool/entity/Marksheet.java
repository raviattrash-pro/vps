package com.visionpublicschool.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@Entity
public class Marksheet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String examType; // e.g., "Mid-Term", "Final"
    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @Convert(converter = SubjectMarkListConverter.class)
    @Column(columnDefinition = "TEXT") // Store as JSON string
    private List<SubjectMark> subjects = new ArrayList<>();

    private Double totalObtained;
    private Double totalMax;
    private Double percentage;
    private String grade;

    public void calculateStats() {
        if (subjects == null) {
            this.totalObtained = 0.0;
            this.totalMax = 0.0;
            this.percentage = 0.0;
            this.grade = "F";
            return;
        }

        this.totalObtained = subjects.stream()
                .mapToDouble(s -> s.getMarksObtained() != null ? s.getMarksObtained() : 0.0)
                .sum();

        this.totalMax = subjects.stream()
                .mapToDouble(s -> s.getMaxMarks() != null ? s.getMaxMarks() : 0.0)
                .sum();
        if (totalMax > 0) {
            this.percentage = (totalObtained / totalMax) * 100;
        } else {
            this.percentage = 0.0;
        }

        if (percentage >= 90)
            this.grade = "A+";
        else if (percentage >= 80)
            this.grade = "A";
        else if (percentage >= 70)
            this.grade = "B";
        else if (percentage >= 60)
            this.grade = "C";
        else if (percentage >= 50)
            this.grade = "D";
        else
            this.grade = "F";
    }

    // Manual Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getExamType() {
        return examType;
    }

    public void setExamType(String examType) {
        this.examType = examType;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public List<SubjectMark> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<SubjectMark> subjects) {
        this.subjects = subjects;
    }

    public Double getTotalObtained() {
        return totalObtained;
    }

    public void setTotalObtained(Double totalObtained) {
        this.totalObtained = totalObtained;
    }

    public Double getTotalMax() {
        return totalMax;
    }

    public void setTotalMax(Double totalMax) {
        this.totalMax = totalMax;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }
}
