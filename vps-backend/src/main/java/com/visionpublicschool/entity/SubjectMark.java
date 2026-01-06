package com.visionpublicschool.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class SubjectMark {
    private String subjectName;
    private Double marksObtained;
    private Double maxMarks;

    public SubjectMark() {
    }

    public SubjectMark(String subjectName, Double marksObtained, Double maxMarks) {
        this.subjectName = subjectName;
        this.marksObtained = marksObtained;
        this.maxMarks = maxMarks;
    }

    // Getters and Setters
    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public Double getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(Double marksObtained) {
        this.marksObtained = marksObtained;
    }

    public Double getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(Double maxMarks) {
        this.maxMarks = maxMarks;
    }
}
