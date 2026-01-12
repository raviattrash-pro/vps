package com.visionpublicschool.controller;

import com.visionpublicschool.entity.AdmissionInquiry;
import com.visionpublicschool.repository.AdmissionInquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admissions")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class AdmissionController {

    @Autowired
    private AdmissionInquiryRepository admissionInquiryRepository;

    @PostMapping("/public")
    public AdmissionInquiry submitInquiry(@RequestBody AdmissionInquiry inquiry) {
        inquiry.setSubmissionDate(LocalDateTime.now());
        inquiry.setStatus("NEW");
        return admissionInquiryRepository.save(inquiry);
    }

    @GetMapping
    public List<AdmissionInquiry> getAllInquiries() {
        return admissionInquiryRepository.findAll();
    }

    @PutMapping("/{id}/status")
    public AdmissionInquiry updateStatus(@PathVariable Long id, @RequestParam String status) {
        AdmissionInquiry inquiry = admissionInquiryRepository.findById(id).orElseThrow();
        inquiry.setStatus(status);
        return admissionInquiryRepository.save(inquiry);
    }
}
