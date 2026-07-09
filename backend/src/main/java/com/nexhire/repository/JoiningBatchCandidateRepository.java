package com.nexhire.repository;

import com.nexhire.entity.JoiningBatchCandidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JoiningBatchCandidateRepository extends JpaRepository<JoiningBatchCandidate, Long> {
    List<JoiningBatchCandidate> findByBatchId(Long batchId);
    List<JoiningBatchCandidate> findByUserId(Long userId);
    Optional<JoiningBatchCandidate> findByBatchIdAndUserId(Long batchId, Long userId);
    boolean existsByUserIdAndStatusNot(Long userId, String status);
}
