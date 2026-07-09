package com.nexhire.repository;

import com.nexhire.entity.ReleaseRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReleaseRecordRepository extends JpaRepository<ReleaseRecord, Long> {
    Optional<ReleaseRecord> findByTraineeId(Long traineeId);
    List<ReleaseRecord> findByAllocated(Boolean allocated);
}
