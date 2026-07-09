package com.nexhire.service;

import com.nexhire.dto.LocationResponse;
import com.nexhire.dto.LocationUpdateRequest;
import com.nexhire.entity.HiringBudget;
import com.nexhire.entity.Location;
import com.nexhire.entity.TrainingSeat;
import com.nexhire.exception.ResourceNotFoundException;
import com.nexhire.repository.HiringBudgetRepository;
import com.nexhire.repository.LocationRepository;
import com.nexhire.repository.TrainingSeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final HiringBudgetRepository hiringBudgetRepository;
    private final TrainingSeatRepository trainingSeatRepository;

    public List<LocationResponse> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public LocationResponse updateLocation(Long locationId, LocationUpdateRequest request) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + locationId));

        if (request.getBudgetTotalSlots() != null) {
            HiringBudget budget = hiringBudgetRepository.findByLocationId(locationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Budget not found for location"));
            budget.setTotalSlots(request.getBudgetTotalSlots());
            hiringBudgetRepository.save(budget);
        }

        if (request.getSeatsTotalSeats() != null) {
            TrainingSeat seats = trainingSeatRepository.findByLocationId(locationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Training seats not found for location"));
            seats.setTotalSeats(request.getSeatsTotalSeats());
            trainingSeatRepository.save(seats);
        }

        if (request.getBudgetAmount() != null) {
            HiringBudget budget = hiringBudgetRepository.findByLocationId(locationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Budget not found for location"));
            budget.setBudgetAmount(request.getBudgetAmount());
            hiringBudgetRepository.save(budget);
        }

        return toResponse(location);
    }

    private LocationResponse toResponse(Location location) {
        HiringBudget budget = hiringBudgetRepository.findByLocationId(location.getId()).orElse(null);
        TrainingSeat seats = trainingSeatRepository.findByLocationId(location.getId()).orElse(null);

        return LocationResponse.builder()
                .id(location.getId())
                .name(location.getName())
                .city(location.getCity())
                .budgetTotal(budget != null ? budget.getTotalSlots() : 0)
                .budgetUsed(budget != null ? budget.getUsedSlots() : 0)
                .budgetAvailable(budget != null ? budget.getTotalSlots() - budget.getUsedSlots() : 0)
                .seatsTotal(seats != null ? seats.getTotalSeats() : 0)
                .seatsOccupied(seats != null ? seats.getOccupiedSeats() : 0)
                .seatsAvailable(seats != null ? seats.getTotalSeats() - seats.getOccupiedSeats() : 0)
                .budgetAmount(budget != null ? budget.getBudgetAmount() : 0L)
                .usedAmount(budget != null ? budget.getUsedAmount() : 0L)
                .remainingAmount(budget != null ? budget.getBudgetAmount() - budget.getUsedAmount() : 0L)
                .build();
    }
}
