package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Student;
import com.visionpublicschool.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowCredentials = "true")
public class AuthController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.visionpublicschool.util.JwtUtil jwtUtil;

    @PostMapping("/login")
    public java.util.Map<String, Object> login(@RequestBody Map<String, String> credentials) {
        String admissionNo = credentials.get("admissionNo");
        String password = credentials.get("password");

        Student student = studentRepository.findByAdmissionNo(admissionNo)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Match raw password with hashed password in DB
        if (!passwordEncoder.matches(password, student.getPassword())) {
            // Fallback: Check if it's a legacy plain-text password (for smooth migration)
            if (student.getPassword().equals(password)) {
                // Auto-migrate to hash on first successful login
                student.setPassword(passwordEncoder.encode(password));
                studentRepository.save(student);
            } else {
                throw new RuntimeException("Invalid credentials");
            }
        }

        student.setLastLogin(java.time.LocalDateTime.now());
        studentRepository.save(student);

        String token = jwtUtil.generateToken(admissionNo);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("token", token);
        response.put("user", student);
        return response;
    }
}
