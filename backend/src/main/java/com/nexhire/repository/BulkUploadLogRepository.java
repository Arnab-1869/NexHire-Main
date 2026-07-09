package com.nexhire.repository;

import com.nexhire.entity.BulkUploadLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BulkUploadLogRepository extends JpaRepository<BulkUploadLog, Long> {
    List<BulkUploadLog> findByUploadTypeOrderByUploadedAtDesc(String uploadType);
}
