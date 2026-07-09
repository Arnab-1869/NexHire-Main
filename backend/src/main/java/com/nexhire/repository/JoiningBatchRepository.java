package com.nexhire.repository;

import com.nexhire.entity.JoiningBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JoiningBatchRepository extends JpaRepository<JoiningBatch, Long> {
    Optional<JoiningBatch> findByBatchCode(String batchCode);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(b.batchCode, 3) AS int)), 1000) FROM JoiningBatch b")
    Integer findMaxBatchCodeNumeric();
}
