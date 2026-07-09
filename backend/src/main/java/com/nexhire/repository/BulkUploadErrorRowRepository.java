package com.nexhire.repository;

import com.nexhire.entity.BulkUploadErrorRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BulkUploadErrorRowRepository extends JpaRepository<BulkUploadErrorRow, Long> {
    List<BulkUploadErrorRow> findByUploadLogId(Long uploadLogId);
}
