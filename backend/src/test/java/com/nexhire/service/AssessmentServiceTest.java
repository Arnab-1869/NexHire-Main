package com.nexhire.service;

import com.nexhire.dto.AssessmentRequest;
import com.nexhire.entity.AssessmentResult;
import com.nexhire.entity.Job;
import com.nexhire.entity.JobApplication;
import com.nexhire.entity.Location;
import com.nexhire.entity.User;
import com.nexhire.enums.ApplicationStatus;
import com.nexhire.enums.UserRole;
import com.nexhire.exception.InvalidStateTransitionException;
import com.nexhire.repository.AssessmentResultRepository;
import com.nexhire.repository.JobApplicationRepository;
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
class AssessmentServiceTest {

    @Mock
    private AssessmentResultRepository assessmentResultRepository;
    @Mock
    private JobApplicationRepository applicationRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AssessmentService assessmentService;

    private JobApplication application;
    private User hrUser;

    @BeforeEach
    void setUp() {
        Location location = Location.builder().id(1L).name("Bangalore").city("Bangalore").build();
        User candidate = User.builder().id(1L).name("John").email("john@test.com").build();
        Job job = Job.builder().id(1L).title("Java Dev").description("Desc").location(location).build();
        application = JobApplication.builder().id(1L).user(candidate).job(job)
                .status(ApplicationStatus.ASSESSMENT_PENDING).build();
        hrUser = User.builder().id(2L).name("HR").email("hr@test.com").role(UserRole.HR).build();
    }

    @Test
    @DisplayName("Enter score from ASSESSMENT_PENDING succeeds")
    void enterScore_fromPending_succeeds() {
        AssessmentRequest request = AssessmentRequest.builder().score(85.0).remarks("Good").build();
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(userRepository.findById(2L)).thenReturn(Optional.of(hrUser));
        when(assessmentResultRepository.save(any())).thenAnswer(inv -> {
            AssessmentResult r = inv.getArgument(0);
            r.setId(1L);
            return r;
        });
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AssessmentResult result = assessmentService.enterScore(1L, request, 2L);

        assertThat(result.getScore()).isEqualTo(85.0);
        verify(applicationRepository).save(argThat(app -> app.getStatus() == ApplicationStatus.ASSESSMENT_COMPLETED));
    }

    @Test
    @DisplayName("Enter score from wrong status throws exception")
    void enterScore_fromWrongStatus_throws() {
        application.setStatus(ApplicationStatus.APPLIED);
        AssessmentRequest request = AssessmentRequest.builder().score(85.0).build();
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> assessmentService.enterScore(1L, request, 2L))
                .isInstanceOf(InvalidStateTransitionException.class);
    }

    @Test
    @DisplayName("Qualify from ASSESSMENT_COMPLETED succeeds")
    void qualify_fromCompleted_succeeds() {
        application.setStatus(ApplicationStatus.ASSESSMENT_COMPLETED);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        JobApplication result = assessmentService.qualify(1L);

        assertThat(result.getStatus()).isEqualTo(ApplicationStatus.QUALIFIED);
    }

    @Test
    @DisplayName("Reject from ASSESSMENT_COMPLETED succeeds")
    void reject_fromCompleted_succeeds() {
        application.setStatus(ApplicationStatus.ASSESSMENT_COMPLETED);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        JobApplication result = assessmentService.reject(1L);

        assertThat(result.getStatus()).isEqualTo(ApplicationStatus.REJECTED);
    }

    @Test
    @DisplayName("Qualify from wrong status throws exception")
    void qualify_fromWrongStatus_throws() {
        application.setStatus(ApplicationStatus.APPLIED);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> assessmentService.qualify(1L))
                .isInstanceOf(InvalidStateTransitionException.class);
    }
}
