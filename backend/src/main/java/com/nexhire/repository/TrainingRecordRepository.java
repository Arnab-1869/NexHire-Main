package com.nexhire.repository;

import com.nexhire.entity.TrainingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainingRecordRepository extends JpaRepository<TrainingRecord, Long> {

    Optional<TrainingRecord> findByTraineeId(Long traineeId);

    Optional<TrainingRecord> findByTraineeUserId(Long userId);
}
