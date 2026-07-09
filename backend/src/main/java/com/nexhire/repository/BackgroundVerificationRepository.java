package com.nexhire.repository;

import com.nexhire.entity.BackgroundVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BackgroundVerificationRepository extends JpaRepository<BackgroundVerification, Long> {

    Optional<BackgroundVerification> findByApplicationId(Long applicationId);

    List<BackgroundVerification> findByApplicationUserId(Long userId);

    boolean existsByApplicationId(Long applicationId);
}
