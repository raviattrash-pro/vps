package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Doubt;
import com.visionpublicschool.entity.DoubtReply;
import com.visionpublicschool.entity.Student;
import com.visionpublicschool.repository.DoubtRepository;
import com.visionpublicschool.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/doubts")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class DoubtController {

    @Autowired
    private DoubtRepository doubtRepository;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public List<Doubt> getAllDoubts(@RequestParam(required = false) String subject) {
        if (subject != null && !subject.isEmpty()) {
            return doubtRepository.findBySubjectOrderByCreatedAtDesc(subject);
        }
        return doubtRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public Doubt askDoubt(@RequestBody Doubt doubt) {
        if (doubt.getStudent() != null && doubt.getStudent().getId() != null) {
            Student student = studentRepository.findById(doubt.getStudent().getId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            doubt.setStudent(student);
        }
        doubt.setCreatedAt(LocalDateTime.now());
        doubt.setStatus("OPEN");
        return doubtRepository.save(doubt);
    }

    @PostMapping("/{id}/reply")
    public Doubt replyToDoubt(@PathVariable Long id, @RequestBody DoubtReply reply) {
        Doubt doubt = doubtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doubt not found"));

        reply.setDoubt(doubt);
        reply.setCreatedAt(LocalDateTime.now());

        doubt.getReplies().add(reply);
        return doubtRepository.save(doubt);
    }
}
