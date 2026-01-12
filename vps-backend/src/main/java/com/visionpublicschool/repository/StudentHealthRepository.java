package com.visionpublicschool.repository;

import com.visionpublicschool.entity.StudentHealth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentHealthRepository extends JpaRepository<StudentHealth, Long> {
    Optional<StudentHealth> findByStudentId(Long studentId);
}
