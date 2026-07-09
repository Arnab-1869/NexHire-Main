package com.nexhire.repository;

import com.nexhire.entity.AssetAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Long> {

    List<AssetAssignment> findByUserIdAndActiveTrue(Long userId);

    List<AssetAssignment> findByUserIdAndActiveFalse(Long userId);

    List<AssetAssignment> findByUserId(Long userId);

    Optional<AssetAssignment> findByAssetIdAndActiveTrue(Long assetId);

    long countByActiveTrue();
}
