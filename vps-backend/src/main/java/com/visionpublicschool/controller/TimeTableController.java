package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Student;
import com.visionpublicschool.entity.TimeTable;
import com.visionpublicschool.repository.StudentRepository;
import com.visionpublicschool.repository.TimeTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class TimeTableController {

    @Autowired
    private TimeTableRepository timeTableRepository;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public List<TimeTable> getTimeTable(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String section) {

        if (studentId != null) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            return timeTableRepository.findByClassNameAndSectionOrderByDayOfWeekAscStartTimeAsc(
                    student.getClassName(), student.getSection());
        }

        if (className != null && section != null) {
            return timeTableRepository.findByClassNameAndSectionOrderByDayOfWeekAscStartTimeAsc(className, section);
        }

        // Return nothing or all?
        return List.of();
    }

    @PostMapping
    public TimeTable createTimeTableEntry(@RequestBody TimeTable timeTable) {
        return timeTableRepository.save(timeTable);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTimeTableEntry(@PathVariable Long id) {
        if (!timeTableRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Entry not found");
        }
        timeTableRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
