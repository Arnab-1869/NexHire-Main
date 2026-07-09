package com.nexhire.repository;

import com.nexhire.entity.User;
import com.nexhire.enums.LifecycleStatus;
import com.nexhire.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByLifecycleStatus(LifecycleStatus lifecycleStatus);

    long countByRole(UserRole role);
}
