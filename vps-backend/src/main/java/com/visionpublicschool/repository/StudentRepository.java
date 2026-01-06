package com.visionpublicschool.repository;

import com.visionpublicschool.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByClassNameAndSection(String className, String section);

    java.util.Optional<Student> findByAdmissionNo(String admissionNo);

    List<Student> findByRole(String role);
}
