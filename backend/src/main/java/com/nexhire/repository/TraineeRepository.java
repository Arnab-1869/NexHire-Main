package com.nexhire.repository;

import com.nexhire.entity.Trainee;
import com.nexhire.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TraineeRepository extends JpaRepository<Trainee, Long> {

    Optional<Trainee> findByUserId(Long userId);

    Optional<Trainee> findByApplicationId(Long applicationId);

    @Query("SELECT t FROM Trainee t WHERE t.application.status = :status")
    List<Trainee> findByApplicationStatus(@Param("status") ApplicationStatus status);

    List<Trainee> findByBatchId(Long batchId);
    List<Trainee> findByFlaggedTrue();
}
