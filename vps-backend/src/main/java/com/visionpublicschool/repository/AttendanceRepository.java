package com.visionpublicschool.repository;

import com.visionpublicschool.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByDate(LocalDate date);

    List<Attendance> findByStudentIdAndDate(Long studentId, LocalDate date);

    List<Attendance> findByStudentId(Long studentId);
}
