package com.visionpublicschool.repository;

import com.visionpublicschool.entity.Marksheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MarksheetRepository extends JpaRepository<Marksheet, Long> {
    List<Marksheet> findByStudentId(Long studentId);

    List<Marksheet> findByStudentClassName(String className);
}
