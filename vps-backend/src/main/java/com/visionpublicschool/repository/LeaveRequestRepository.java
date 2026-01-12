package com.visionpublicschool.repository;

import com.visionpublicschool.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findAllByOrderByStartDateDesc();

    List<LeaveRequest> findByTeacherIdOrderByStartDateDesc(Long teacherId);
}
