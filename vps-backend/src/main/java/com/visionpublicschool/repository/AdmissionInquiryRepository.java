package com.visionpublicschool.repository;

import com.visionpublicschool.entity.AdmissionInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdmissionInquiryRepository extends JpaRepository<AdmissionInquiry, Long> {
}
