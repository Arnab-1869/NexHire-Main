package com.nexhire.service;

import com.nexhire.dto.JoiningLetterRequest;
import com.nexhire.dto.JoiningLetterResponse;
import com.nexhire.entity.*;
import com.nexhire.enums.ApplicationStatus;
import com.nexhire.enums.LifecycleStatus;
import com.nexhire.enums.UserRole;
import com.nexhire.exception.InsufficientResourceException;
import com.nexhire.exception.InvalidStateTransitionException;
import com.nexhire.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JoiningLetterServiceTest {

    @Mock private JoiningLetterRepository joiningLetterRepository;
    @Mock private JobApplicationRepository applicationRepository;
    @Mock private UserRepository userRepository;
    @Mock private LocationRepository locationRepository;
    @Mock private HiringBudgetRepository hiringBudgetRepository;
    @Mock private TrainingSeatRepository trainingSeatRepository;
    @Mock private TraineeRepository traineeRepository;
    @Mock private TrainingRecordRepository trainingRecordRepository;
    @Mock private ActivityLogRepository activityLogRepository;

    @InjectMocks
    private JoiningLetterService joiningLetterService;

    private JobApplication application;
    private User candidate;
    private User hrUser;
    private Location location;
    private HiringBudget budget;
    private TrainingSeat seats;
    private JoiningLetterRequest request;

    @BeforeEach
    void setUp() {
        location = Location.builder().id(1L).name("Bangalore").city("Bangalore").build();
        candidate = User.builder().id(1L).name("John").email("john@test.com")
                .role(UserRole.EMPLOYEE).lifecycleStatus(LifecycleStatus.CANDIDATE).active(true).build();
        Job job = Job.builder().id(1L).title("Java Dev").description("Desc").location(location).build();
        application = JobApplication.builder().id(1L).user(candidate).job(job)
                .status(ApplicationStatus.OFFER_ACCEPTED).build();
        hrUser = User.builder().id(2L).name("HR").email("hr@test.com").role(UserRole.HR).build();
        budget = HiringBudget.builder().id(1L).location(location).totalSlots(10).usedSlots(2).build();
        seats = TrainingSeat.builder().id(1L).location(location).totalSeats(15).occupiedSeats(3).build();
        request = JoiningLetterRequest.builder()
                .content("Welcome").joiningDate(LocalDate.now().plusDays(7)).locationId(1L).build();
    }

    @Test
    @DisplayName("Send joining letter from OFFER_ACCEPTED with resources available succeeds")
    void sendJoiningLetter_fromOfferAccepted_withResources_succeeds() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(locationRepository.findById(1L)).thenReturn(Optional.of(location));
        when(hiringBudgetRepository.findByLocationId(1L)).thenReturn(Optional.of(budget));
        when(trainingSeatRepository.findByLocationId(1L)).thenReturn(Optional.of(seats));
        when(userRepository.findById(2L)).thenReturn(Optional.of(hrUser));
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(joiningLetterRepository.save(any())).thenAnswer(inv -> {
            JoiningLetter jl = inv.getArgument(0);
            jl.setId(1L);
            return jl;
        });

        JoiningLetterResponse response = joiningLetterService.sendJoiningLetter(1L, request, 2L);

        assertThat(response.getStatus()).isEqualTo("JOINING_LETTER_SENT");
        verify(hiringBudgetRepository).save(argThat(b -> b.getUsedSlots() == 3));
        verify(trainingSeatRepository).save(argThat(s -> s.getOccupiedSeats() == 4));
    }

    @Test
    @DisplayName("Send joining letter from OFFER_ACCEPTED with no budget sets JOINING_ON_HOLD")
    void sendJoiningLetter_noBudget_setsOnHold() {
        budget.setUsedSlots(10); // all used
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(locationRepository.findById(1L)).thenReturn(Optional.of(location));
        when(hiringBudgetRepository.findByLocationId(1L)).thenReturn(Optional.of(budget));
        when(trainingSeatRepository.findByLocationId(1L)).thenReturn(Optional.of(seats));
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> joiningLetterService.sendJoiningLetter(1L, request, 2L))
                .isInstanceOf(InsufficientResourceException.class)
                .hasMessageContaining("JOINING_ON_HOLD")
                .hasMessageContaining("budget");

        verify(applicationRepository).save(argThat(app ->
                app.getStatus() == ApplicationStatus.JOINING_ON_HOLD
                        && app.getHoldReason().contains("budget")
                        && app.getHoldCreatedAt() != null));
        // No resources consumed
        verify(hiringBudgetRepository, never()).save(argThat(b -> b.getUsedSlots() > 10));
        verify(trainingSeatRepository, never()).save(any());
    }

    @Test
    @DisplayName("Send joining letter from OFFER_ACCEPTED with no seats sets JOINING_ON_HOLD")
    void sendJoiningLetter_noSeats_setsOnHold() {
        seats.setOccupiedSeats(15); // all occupied
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(locationRepository.findById(1L)).thenReturn(Optional.of(location));
        when(hiringBudgetRepository.findByLocationId(1L)).thenReturn(Optional.of(budget));
        when(trainingSeatRepository.findByLocationId(1L)).thenReturn(Optional.of(seats));
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> joiningLetterService.sendJoiningLetter(1L, request, 2L))
                .isInstanceOf(InsufficientResourceException.class)
                .hasMessageContaining("JOINING_ON_HOLD")
                .hasMessageContaining("seats");

        verify(applicationRepository).save(argThat(app ->
                app.getStatus() == ApplicationStatus.JOINING_ON_HOLD
                        && app.getHoldReason().contains("seats")));
    }

    @Test
    @DisplayName("Send joining letter from JOINING_ON_HOLD succeeds when resources become available")
    void sendJoiningLetter_fromOnHold_withResources_succeeds() {
        application.setStatus(ApplicationStatus.JOINING_ON_HOLD);
        application.setHoldReason("Insufficient hiring budget for location: Bangalore");
        application.setHoldCreatedAt(LocalDateTime.now().minusDays(1));

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(locationRepository.findById(1L)).thenReturn(Optional.of(location));
        when(hiringBudgetRepository.findByLocationId(1L)).thenReturn(Optional.of(budget));
        when(trainingSeatRepository.findByLocationId(1L)).thenReturn(Optional.of(seats));
        when(userRepository.findById(2L)).thenReturn(Optional.of(hrUser));
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(joiningLetterRepository.save(any())).thenAnswer(inv -> {
            JoiningLetter jl = inv.getArgument(0);
            jl.setId(1L);
            return jl;
        });

        JoiningLetterResponse response = joiningLetterService.sendJoiningLetter(1L, request, 2L);

        assertThat(response.getStatus()).isEqualTo("JOINING_LETTER_SENT");
        verify(applicationRepository).save(argThat(app ->
                app.getStatus() == ApplicationStatus.JOINING_LETTER_SENT
                        && app.getHoldResolvedAt() != null));
    }

    @Test
    @DisplayName("Send joining letter after OFFER_REJECTED fails")
    void sendJoiningLetter_afterOfferRejected_fails() {
        application.setStatus(ApplicationStatus.OFFER_REJECTED);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> joiningLetterService.sendJoiningLetter(1L, request, 2L))
                .isInstanceOf(InvalidStateTransitionException.class)
                .hasMessageContaining("OFFER_ACCEPTED or JOINING_ON_HOLD");
    }

    @Test
    @DisplayName("Accept joining letter creates trainee, training record, updates lifecycle")
    void acceptJoiningLetter_succeeds() {
        application.setStatus(ApplicationStatus.JOINING_LETTER_SENT);
        JoiningLetter letter = JoiningLetter.builder().id(1L).application(application)
                .content("Welcome").joiningDate(LocalDate.now()).location(location)
                .sentBy(hrUser).sentAt(LocalDateTime.now()).build();

        when(joiningLetterRepository.findById(1L)).thenReturn(Optional.of(letter));
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(traineeRepository.save(any())).thenAnswer(inv -> {
            Trainee t = inv.getArgument(0);
            t.setId(1L);
            return t;
        });
        when(trainingRecordRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(activityLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(joiningLetterRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        JoiningLetterResponse response = joiningLetterService.acceptJoiningLetter(1L, 1L);

        assertThat(response.getStatus()).isEqualTo("TRAINING_IN_PROGRESS");
        verify(userRepository).save(argThat(u -> u.getLifecycleStatus() == LifecycleStatus.TRAINEE));
        verify(traineeRepository).save(any(Trainee.class));
        verify(trainingRecordRepository).save(argThat(tr -> tr.getProgress() == 0 && !tr.getCompleted()));
        verify(activityLogRepository).save(any(ActivityLog.class));
    }
}
