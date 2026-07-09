package com.nexhire.repository;

import com.nexhire.entity.ProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, Long> {

    Optional<ProjectAssignment> findByTraineeId(Long traineeId);

    boolean existsByProjectId(Long projectId);
}
