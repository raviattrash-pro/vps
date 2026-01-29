package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Student;
import com.visionpublicschool.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowCredentials = "true")
public class StudentController {

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findByRole("STUDENT");
    }

    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        if (student.getPassword() == null || student.getPassword().isEmpty()) {
            student.setPassword(passwordEncoder.encode("1234"));
        } else {
            student.setPassword(passwordEncoder.encode(student.getPassword()));
        }
        if (student.getRole() == null) {
            student.setRole("STUDENT");
        }
        return studentRepository.save(student);
    }

    @PostMapping("/{id}/change-password")
    public org.springframework.http.ResponseEntity<?> changePassword(@PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload) {
        Student student = studentRepository.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));
        String newPassword = payload.get("password");
        student.setPassword(passwordEncoder.encode(newPassword));
        student.setPasswordChanged(true);
        studentRepository.save(student);
        return org.springframework.http.ResponseEntity.ok("Password changed successfully");
    }
}
