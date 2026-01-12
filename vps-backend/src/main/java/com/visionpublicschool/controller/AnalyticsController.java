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

    @GetMapping("/rankings")
    public List<Map<String, Object>> getStudentRankings(@RequestParam String className) {
        List<Marksheet> allMarksheets = marksheetRepository.findByStudentClassName(className);

        // Group by Student
        Map<Long, List<Marksheet>> studentMap = new HashMap<>();
        for (Marksheet m : allMarksheets) {
            if (m.getStudent() != null) {
                studentMap.computeIfAbsent(m.getStudent().getId(), k -> new java.util.ArrayList<>()).add(m);
            }
        }

        List<Map<String, Object>> rankings = new java.util.ArrayList<>();

        for (Map.Entry<Long, List<Marksheet>> entry : studentMap.entrySet()) {
            List<Marksheet> sheets = entry.getValue();
            if (sheets.isEmpty())
                continue;

            double totalPercentage = 0;
            for (Marksheet m : sheets) {
                totalPercentage += (m.getPercentage() != null ? m.getPercentage() : 0.0);
            }
            double avgPercentage = totalPercentage / sheets.size();

            // Get student details from the first marksheet
            com.visionpublicschool.entity.Student s = sheets.get(0).getStudent();

            Map<String, Object> data = new HashMap<>();
            data.put("studentId", s.getId());
            data.put("name", s.getName());
            data.put("averagePercentage", Math.round(avgPercentage * 100.0) / 100.0); // Round to 2 decimals

            rankings.add(data);
        }

        // Sort by Average Percentage DESC
        rankings.sort((a, b) -> {
            Double p1 = (Double) a.get("averagePercentage");
            Double p2 = (Double) b.get("averagePercentage");
            return p2.compareTo(p1);
        });

        // Assign Rank
        for (int i = 0; i < rankings.size(); i++) {
            rankings.get(i).put("rank", i + 1);
        }

        return rankings;
    }
}
