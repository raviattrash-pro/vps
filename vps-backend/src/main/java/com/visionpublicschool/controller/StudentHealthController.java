package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Student;
import com.visionpublicschool.entity.StudentHealth;
import com.visionpublicschool.repository.StudentRepository;
import com.visionpublicschool.repository.StudentHealthRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class StudentHealthController {

    @Autowired
    private StudentHealthRepository studentHealthRepository;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/{studentId}")
    public ResponseEntity<StudentHealth> getHealthProfile(@PathVariable Long studentId) {
        return studentHealthRepository.findByStudentId(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> updateHealthProfile(@RequestBody StudentHealth healthData) {
        if (healthData.getStudent() == null || healthData.getStudent().getId() == null) {
            return ResponseEntity.badRequest().body("Student ID required");
        }

        Student student = studentRepository.findById(healthData.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if exists, update or create
        StudentHealth healthProfile = studentHealthRepository.findByStudentId(student.getId())
                .orElse(new StudentHealth());

        healthProfile.setStudent(student);
        healthProfile.setBloodGroup(healthData.getBloodGroup());
        healthProfile.setHeight(healthData.getHeight());
        healthProfile.setWeight(healthData.getWeight());
        healthProfile.setAllergies(healthData.getAllergies());
        healthProfile.setMedications(healthData.getMedications());
        healthProfile.setEmergencyContactName(healthData.getEmergencyContactName());
        healthProfile.setEmergencyContactNumber(healthData.getEmergencyContactNumber());
        healthProfile.setDoctorName(healthData.getDoctorName());
        healthProfile.setDoctorContact(healthData.getDoctorContact());

        StudentHealth saved = studentHealthRepository.save(healthProfile);
        return ResponseEntity.ok(saved);
    }
}
