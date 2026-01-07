package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Student;
import com.visionpublicschool.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowCredentials = "true")
public class AdminController {

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/users")
    public List<Student> getAllUsers() {
        return studentRepository.findAll();
    }

    @Autowired
    private com.visionpublicschool.service.FileStorageService fileStorageService;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @PostMapping(value = "/users", consumes = { "multipart/form-data" })
    public Student createUser(@RequestPart("student") String studentJson,
            @RequestPart(value = "file", required = false) org.springframework.web.multipart.MultipartFile file)
            throws com.fasterxml.jackson.core.JsonProcessingException {
        Student student = objectMapper.readValue(studentJson, Student.class);

        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            String fileUrl = "/uploads/" + fileName;
            student.setProfilePhoto(fileUrl);
        }

        // Auto-assign Roll No for Students
        if ("STUDENT".equals(student.getRole()) && (student.getRollNo() == null || student.getRollNo().isEmpty())) {
            List<Student> classStudents = studentRepository.findByClassNameAndSection(student.getClassName(),
                    student.getSection());
            int maxRoll = 0;
            for (Student s : classStudents) {
                try {
                    int roll = Integer.parseInt(s.getRollNo());
                    if (roll > maxRoll)
                        maxRoll = roll;
                } catch (NumberFormatException e) {
                    // Ignore non-numeric roll numbers
                }
            }
            student.setRollNo(String.valueOf(maxRoll + 1));
        }

        return studentRepository.save(student);
    }

    @Autowired
    private com.visionpublicschool.repository.AttendanceRepository attendanceRepository;

    @Autowired
    private com.visionpublicschool.repository.PaymentRepository paymentRepository;
    @Autowired
    private com.visionpublicschool.repository.MarksheetRepository marksheetRepository;

    @PutMapping(value = "/users/{id}", consumes = { "multipart/form-data" })
    public Student updateUser(@PathVariable Long id,
            @RequestPart("student") String studentJson,
            @RequestPart(value = "file", required = false) org.springframework.web.multipart.MultipartFile file)
            throws com.fasterxml.jackson.core.JsonProcessingException {
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Student updatedData = objectMapper.readValue(studentJson, Student.class);

        existingStudent.setName(updatedData.getName());
        existingStudent.setAdmissionNo(updatedData.getAdmissionNo());
        existingStudent.setRole(updatedData.getRole());

        if (updatedData.getPassword() != null && !updatedData.getPassword().isEmpty()) {
            existingStudent.setPassword(updatedData.getPassword());
        }

        if ("STUDENT".equals(updatedData.getRole()) || "TEACHER".equals(updatedData.getRole())) {
            existingStudent.setClassName(updatedData.getClassName());
            existingStudent.setSection(updatedData.getSection());
        }

        if ("STUDENT".equals(updatedData.getRole())) {
            existingStudent.setRollNo(updatedData.getRollNo());
        }

        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            String fileUrl = "/uploads/" + fileName;
            existingStudent.setProfilePhoto(fileUrl);
        }

        return studentRepository.save(existingStudent);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        // Delete dependent data manually since we don't have cascade set up in DB
        // 1. Delete Attendance
        List<com.visionpublicschool.entity.Attendance> attendanceList = attendanceRepository.findByStudentId(id);
        attendanceRepository.deleteAll(attendanceList);

        // 2. Delete Payments
        List<com.visionpublicschool.entity.Payment> paymentList = paymentRepository.findByStudentId(id);
        paymentRepository.deleteAll(paymentList);

        // 3. Delete Marksheets
        List<com.visionpublicschool.entity.Marksheet> marksheetList = marksheetRepository.findByStudentId(id);
        marksheetRepository.deleteAll(marksheetList);

        // 4. Delete Student
        studentRepository.deleteById(id);
    }
}
