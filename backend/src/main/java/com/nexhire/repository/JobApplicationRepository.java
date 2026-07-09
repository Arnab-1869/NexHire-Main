package com.nexhire.repository;

import com.nexhire.entity.JobApplication;
import com.nexhire.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserId(Long userId);

    Optional<JobApplication> findByUserIdAndJobId(Long userId, Long jobId);

    List<JobApplication> findByStatus(ApplicationStatus status);

    long countByStatus(ApplicationStatus status);

    List<JobApplication> findAllByOrderByAppliedAtDesc();

    boolean existsByUserIdAndJobId(Long userId, Long jobId);
}
