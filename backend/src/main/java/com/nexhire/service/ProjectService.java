package com.nexhire.service;

import com.nexhire.dto.ProjectAssignmentResponse;
import com.nexhire.dto.ProjectRequest;
import com.nexhire.dto.ProjectResponse;
import com.nexhire.dto.TraineeResponse;
import com.nexhire.entity.*;
import com.nexhire.enums.ApplicationStatus;
import com.nexhire.enums.LifecycleStatus;
import com.nexhire.exception.DuplicateResourceException;
import com.nexhire.exception.InvalidStateTransitionException;
import com.nexhire.exception.ResourceNotFoundException;
import com.nexhire.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final TraineeRepository traineeRepository;
    private final TrainingRecordRepository trainingRecordRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /** ADMIN + RMG: list all projects (RMG filters to active ones client-side for allocation). */
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream().map(this::toProjectResponse).toList();
    }

    /** ADMIN: create a project. */
    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        return toProjectResponse(projectRepository.save(project));
    }

    /** ADMIN: update an existing project's details. */
    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getActive() != null) {
            project.setActive(request.getActive());
        }
        return toProjectResponse(projectRepository.save(project));
    }

    /** ADMIN: delete a project. Blocked while trainees are still assigned to it. */
    @Transactional
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        if (projectAssignmentRepository.existsByProjectId(projectId)) {
            throw new InvalidStateTransitionException(
                    "Cannot delete a project that still has trainees assigned to it");
        }
        projectRepository.delete(project);
    }

    /** RMG: trainees eligible for assignment (released == true). */
    public List<TraineeResponse> getEligibleTrainees() {
        return traineeRepository.findAll().stream()
                .filter(t -> Boolean.TRUE.equals(t.getReleased()))
                .filter(t -> !projectAssignmentRepository.findByTraineeId(t.getId()).isPresent())
                .map(this::toTraineeResponse).toList();
    }

    /**
     * RMG: assign a training-completed trainee to a project.
     * Sets applicationStatus + lifecycleStatus to PROJECT_ASSIGNED.
     */
    @Transactional
    public ProjectAssignmentResponse assignTrainee(Long projectId, Long traineeId, Long assignedById) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Trainee trainee = traineeRepository.findById(traineeId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainee not found with id: " + traineeId));

        JobApplication application = trainee.getApplication();
        if (!Boolean.TRUE.equals(trainee.getReleased())) {
            throw new InvalidStateTransitionException(
                    "Cannot assign: trainee must be released first");
        }

        if (projectAssignmentRepository.findByTraineeId(traineeId).isPresent()) {
            throw new DuplicateResourceException("Trainee already assigned to a project");
        }

        User assignedBy = userRepository.findById(assignedById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ProjectAssignment assignment = ProjectAssignment.builder()
                .trainee(trainee)
                .project(project)
                .assignedBy(assignedBy)
                .assignedAt(LocalDateTime.now())
                .build();
        projectAssignmentRepository.save(assignment);

        // Update statuses
        application.setStatus(ApplicationStatus.PROJECT_ASSIGNED);
        applicationRepository.save(application);

        User user = trainee.getUser();
        user.setLifecycleStatus(LifecycleStatus.PROJECT_ASSIGNED);
        userRepository.save(user);

        // Increment team size
        project.setTeamSize(project.getTeamSize() + 1);
        projectRepository.save(project);

        // Notify trainee about project assignment
        notificationService.notify(user.getId(), "PROJECT_ASSIGNED",
                "Project Assigned",
                "You have been assigned to project: " + project.getName() + ". Welcome to the team!");

        return ProjectAssignmentResponse.builder()
                .id(assignment.getId())
                .traineeId(trainee.getId())
                .projectId(project.getId())
                .projectName(project.getName())
                .candidateName(user.getName())
                .candidateEmail(user.getEmail())
                .assignedByName(assignedBy.getName())
                .assignedAt(assignment.getAssignedAt())
                .build();
    }

    private ProjectResponse toProjectResponse(Project p) {
        return ProjectResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .active(p.getActive())
                .teamSize(p.getTeamSize())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private TraineeResponse toTraineeResponse(Trainee trainee) {
        TrainingRecord record = trainingRecordRepository.findByTraineeId(trainee.getId()).orElse(null);
        JobApplication app = trainee.getApplication();
        return TraineeResponse.builder()
                .traineeId(trainee.getId())
                .userId(trainee.getUser().getId())
                .applicationId(app.getId())
                .candidateName(trainee.getUser().getName())
                .candidateEmail(trainee.getUser().getEmail())
                .jobTitle(app.getJob().getTitle())
                .applicationStatus(app.getStatus().name())
                .progress(record != null ? record.getProgress() : 0)
                .topic(record != null ? record.getTopic() : null)
                .completed(record != null ? record.getCompleted() : false)
                .joinedAt(trainee.getJoinedAt())
                .updatedAt(record != null ? record.getUpdatedAt() : null)
                .build();
    }
}
