package com.visionpublicschool.repository;

import com.visionpublicschool.entity.LiveSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LiveSessionRepository extends JpaRepository<LiveSession, Long> {
    // We can fetch the first active one, or all.
    LiveSession findTopByIsActiveTrueOrderByStartTimeDesc();

    List<LiveSession> findByClassNameAndSectionAndIsActiveTrue(String className, String section);

    LiveSession findTopByClassNameAndSectionAndIsActiveTrueOrderByStartTimeDesc(String className, String section);
}
