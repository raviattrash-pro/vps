package com.visionpublicschool.repository;

import com.visionpublicschool.entity.Doubt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DoubtRepository extends JpaRepository<Doubt, Long> {
    List<Doubt> findAllByOrderByCreatedAtDesc();

    List<Doubt> findBySubjectOrderByCreatedAtDesc(String subject);
}
