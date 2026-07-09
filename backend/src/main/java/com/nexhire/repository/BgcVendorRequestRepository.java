package com.nexhire.repository;

import com.nexhire.entity.BgcVendorRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BgcVendorRequestRepository extends JpaRepository<BgcVendorRequest, Long> {
    List<BgcVendorRequest> findByBgcCaseId(Long bgcCaseId);
}
