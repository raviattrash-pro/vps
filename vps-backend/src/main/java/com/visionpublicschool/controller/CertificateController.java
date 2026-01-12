package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Certificate;
import com.visionpublicschool.entity.Student;
import com.visionpublicschool.repository.CertificateRepository;
import com.visionpublicschool.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/certificates")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class CertificateController {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/student/{studentId}")
    public List<Certificate> getStudentCertificates(@PathVariable Long studentId) {
        return certificateRepository.findByStudentIdOrderByIssueDateDesc(studentId);
    }

    @PostMapping("/generate")
    public Certificate generateCertificate(@RequestBody Certificate certRequest) {
        if (certRequest.getStudent() == null || certRequest.getStudent().getId() == null) {
            throw new RuntimeException("Student ID required");
        }

        Student student = studentRepository.findById(certRequest.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        certRequest.setStudent(student);
        certRequest.setIssueDate(LocalDate.now());
        certRequest.setCertificateNumber("VPS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        return certificateRepository.save(certRequest);
    }
}
