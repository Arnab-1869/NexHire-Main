package com.nexhire.repository;

import com.nexhire.entity.SelectedUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SelectedUserRepository extends JpaRepository<SelectedUser, Long> {
    Optional<SelectedUser> findByUserId(Long userId);
    Optional<SelectedUser> findByEmployeeId(String employeeId);
    boolean existsByUserId(Long userId);
}
