package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Marksheet;
import com.visionpublicschool.entity.SubjectMark;
import com.visionpublicschool.repository.MarksheetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class AnalyticsController {

    @Autowired
    private MarksheetRepository marksheetRepository;

    @GetMapping("/class-average")
    public Map<String, Double> getClassAverage(@RequestParam String className) {
        List<Marksheet> results = marksheetRepository.findByStudentClassName(className);

        // Calculate average per subject
        Map<String, List<Double>> subjectMarks = new HashMap<>();

        for (Marksheet r : results) {
            for (SubjectMark sm : r.getSubjects()) {
                subjectMarks.computeIfAbsent(sm.getSubjectName(), k -> new java.util.ArrayList<>())
                        .add(sm.getMarksObtained());
            }
        }

        Map<String, Double> averages = new HashMap<>();
        for (Map.Entry<String, List<Double>> entry : subjectMarks.entrySet()) {
            double avg = entry.getValue().stream().mapToDouble(val -> val != null ? val : 0.0).average().orElse(0.0);
            averages.put(entry.getKey(), avg);
        }

        return averages;
    }
}
