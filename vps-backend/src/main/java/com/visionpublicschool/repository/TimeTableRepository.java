package com.visionpublicschool.repository;

import com.visionpublicschool.entity.TimeTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimeTableRepository extends JpaRepository<TimeTable, Long> {
    List<TimeTable> findByClassNameAndSectionOrderByDayOfWeekAscStartTimeAsc(String className, String section);

    List<TimeTable> findByTeacherNameOrderByDayOfWeekAscStartTimeAsc(String teacherName); // For teacher view
}
