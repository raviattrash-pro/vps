package com.visionpublicschool.repository;

import com.visionpublicschool.entity.Content;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {
    List<Content> findByClassNameAndSection(String className, String section);
}
