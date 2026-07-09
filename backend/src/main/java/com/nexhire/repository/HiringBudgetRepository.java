package com.nexhire.repository;

import com.nexhire.entity.HiringBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HiringBudgetRepository extends JpaRepository<HiringBudget, Long> {

    Optional<HiringBudget> findByLocationId(Long locationId);
}
