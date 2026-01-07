package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Student;
import com.visionpublicschool.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowCredentials = "true")
public class AuthController {

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/login")
    public Student login(@RequestBody Map<String, String> credentials) {
        String admissionNo = credentials.get("admissionNo");
        String password = credentials.get("password");

        Student student = studentRepository.findByAdmissionNo(admissionNo)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!student.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }

        student.setLastLogin(java.time.LocalDateTime.now());
        return studentRepository.save(student);
    }
}
