package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Visitor;
import com.visionpublicschool.repository.VisitorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/visitors")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class VisitorController {

    @Autowired
    private VisitorRepository visitorRepository;

    @GetMapping
    public List<Visitor> getAllVisitors() {
        return visitorRepository.findAllByOrderByCheckInTimeDesc();
    }

    @PostMapping("/checkin")
    public Visitor checkIn(@RequestBody Visitor visitor) {
        visitor.setCheckInTime(LocalDateTime.now());
        visitor.setStatus("IN");
        return visitorRepository.save(visitor);
    }

    @PutMapping("/{id}/checkout")
    public Visitor checkOut(@PathVariable Long id) {
        Visitor visitor = visitorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visitor not found"));

        if ("OUT".equals(visitor.getStatus())) {
            throw new RuntimeException("Visitor already checked out");
        }

        visitor.setCheckOutTime(LocalDateTime.now());
        visitor.setStatus("OUT");
        return visitorRepository.save(visitor);
    }
}
