package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Result;
import com.visionpublicschool.repository.ResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class AnalyticsController {

    @Autowired
    private ResultRepository resultRepository;

    @GetMapping("/class-average")
    public Map<String, Double> getClassAverage(@RequestParam String className) {
        List<Result> results = resultRepository.findByClassName(className);

        // Calculate average per subject
        Map<String, List<Double>> subjectMarks = new HashMap<>();

        for (Result r : results) {
            subjectMarks.computeIfAbsent(r.getSubject(), k -> new java.util.ArrayList<>())
                    .add(Double.valueOf(r.getMarksObtained()));
        }

        Map<String, Double> averages = new HashMap<>();
        for (Map.Entry<String, List<Double>> entry : subjectMarks.entrySet()) {
            double avg = entry.getValue().stream().mapToDouble(val -> val).average().orElse(0.0);
            averages.put(entry.getKey(), avg);
        }

        return averages;
    }
}
