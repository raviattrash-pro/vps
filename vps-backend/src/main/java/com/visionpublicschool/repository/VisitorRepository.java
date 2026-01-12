package com.visionpublicschool.repository;

import com.visionpublicschool.entity.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    List<Visitor> findAllByOrderByCheckInTimeDesc();

    List<Visitor> findByStatus(String status);
}
