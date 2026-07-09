package com.nexhire.repository;

import com.nexhire.entity.BgcDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BgcDocumentRepository extends JpaRepository<BgcDocument, Long> {
    List<BgcDocument> findByBgcCaseId(Long bgcCaseId);
    List<BgcDocument> findByCandidateId(Long candidateId);
}
