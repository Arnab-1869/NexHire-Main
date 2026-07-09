package com.nexhire.repository;

import com.nexhire.entity.TrainingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainingSeatRepository extends JpaRepository<TrainingSeat, Long> {

    Optional<TrainingSeat> findByLocationId(Long locationId);
}
