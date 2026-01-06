package com.visionpublicschool.repository;

import com.visionpublicschool.entity.StudyMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {
}
