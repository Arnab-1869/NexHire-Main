package com.nexhire.service;

import com.nexhire.dto.ApplicationResponse;
import com.nexhire.entity.Job;
import com.nexhire.entity.JobApplication;
import com.nexhire.entity.Location;
import com.nexhire.entity.User;
import com.nexhire.enums.ApplicationStatus;
import com.nexhire.enums.LifecycleStatus;
import com.nexhire.enums.UserRole;
import com.nexhire.exception.DuplicateResourceException;
import com.nexhire.exception.InvalidStateTransitionException;
import com.nexhire.repository.BackgroundVerificationRepository;
import com.nexhire.repository.JobApplicationRepository;
import com.nexhire.repository.JobRepository;
import com.nexhire.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private JobApplicationRepository applicationRepository;
    @Mock
    private JobRepository jobRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BackgroundVerificationRepository bgvRepository;

    @InjectMocks
    private ApplicationService applicationService;

    private User user;
    private Job job;
    private JobApplication application;

    @BeforeEach
    void setUp() {
        Location location = Location.builder().id(1L).name("Bangalore").city("Bangalore").build();
        user = User.builder().id(1L).name("John").email("john@test.com").role(UserRole.EMPLOYEE)
                .lifecycleStatus(LifecycleStatus.CANDIDATE).active(true).build();
        job = Job.builder().id(1L).title("Java Dev").description("Desc").location(location).active(true).build();
        application = JobApplication.builder().id(1L).user(user).job(job).status(ApplicationStatus.APPLIED).build();
    }

    @Test
    @DisplayName("Apply creates application with APPLIED status")
    void apply_shouldCreateWithAppliedStatus() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(jobRepository.findById(1L)).thenReturn(Optional.of(job));
        when(applicationRepository.existsByUserIdAndJobId(1L, 1L)).thenReturn(false);
        when(applicationRepository.save(any(JobApplication.class))).thenReturn(application);

        ApplicationResponse response = applicationService.applyToJob(1L, 1L);

        assertThat(response.getStatus()).isEqualTo("APPLIED");
        verify(applicationRepository).save(argThat(app -> app.getStatus() == ApplicationStatus.APPLIED));
    }

    @Test
    @DisplayName("Duplicate application returns 409")
    void apply_duplicate_shouldThrowException() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(jobRepository.findById(1L)).thenReturn(Optional.of(job));
        when(applicationRepository.existsByUserIdAndJobId(1L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> applicationService.applyToJob(1L, 1L))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    @DisplayName("Start assessment transitions APPLIED to ASSESSMENT_PENDING")
    void startAssessment_validTransition() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ApplicationResponse response = applicationService.startAssessment(1L);

        assertThat(response.getStatus()).isEqualTo("ASSESSMENT_PENDING");
    }

    @Test
    @DisplayName("Start assessment from wrong status throws exception")
    void startAssessment_invalidTransition() {
        application.setStatus(ApplicationStatus.ASSESSMENT_COMPLETED);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> applicationService.startAssessment(1L))
                .isInstanceOf(InvalidStateTransitionException.class);
    }
}
