package com.nexhire.repository;

import com.nexhire.entity.JoiningLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JoiningLetterRepository extends JpaRepository<JoiningLetter, Long> {

    Optional<JoiningLetter> findByApplicationId(Long applicationId);

    List<JoiningLetter> findByApplicationUserId(Long userId);
}
