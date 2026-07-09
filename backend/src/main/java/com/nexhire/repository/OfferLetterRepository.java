package com.nexhire.repository;

import com.nexhire.entity.OfferLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfferLetterRepository extends JpaRepository<OfferLetter, Long> {

    Optional<OfferLetter> findByApplicationId(Long applicationId);

    List<OfferLetter> findByApplicationUserId(Long userId);
}
