package com.visionpublicschool.repository;

import com.visionpublicschool.entity.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    List<BlogPost> findByIsPublishedTrueOrderByPublishDateDesc();
}
