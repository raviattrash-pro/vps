package com.visionpublicschool.controller;

import com.visionpublicschool.entity.LeaveRequest;
import com.visionpublicschool.entity.Student;
import com.visionpublicschool.repository.LeaveRequestRepository;
import com.visionpublicschool.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class LeaveController {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public List<LeaveRequest> getLeaves(@RequestParam(required = false) Long teacherId) {
        if (teacherId != null) {
            return leaveRequestRepository.findByTeacherIdOrderByStartDateDesc(teacherId);
        }
        return leaveRequestRepository.findAllByOrderByStartDateDesc();
    }

    @PostMapping
    public LeaveRequest applyForLeave(@RequestBody LeaveRequest leaveRequest) {
        if (leaveRequest.getTeacher() != null && leaveRequest.getTeacher().getId() != null) {
            Student teacher = studentRepository.findById(leaveRequest.getTeacher().getId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            leaveRequest.setTeacher(teacher);
        }
        leaveRequest.setStatus("PENDING");
        return leaveRequestRepository.save(leaveRequest);
    }

    @PutMapping("/{id}/status")
    public LeaveRequest updateStatus(@PathVariable Long id, @RequestParam String status) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leave.setStatus(status);
        return leaveRequestRepository.save(leave);
    }
}
