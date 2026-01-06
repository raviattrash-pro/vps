package com.visionpublicschool.repository;

import com.visionpublicschool.entity.ClassFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassFeeRepository extends JpaRepository<ClassFee, Long> {
    Optional<ClassFee> findByClassName(String className);
}
