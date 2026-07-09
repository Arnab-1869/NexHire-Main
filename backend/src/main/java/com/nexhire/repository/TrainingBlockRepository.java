package com.nexhire.repository;

import com.nexhire.entity.TrainingBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingBlockRepository extends JpaRepository<TrainingBlock, Long> {
    List<TrainingBlock> findByLocationId(Long locationId);
    Optional<TrainingBlock> findByNameAndLocationId(String name, Long locationId);
}
