package com.nexhire.seed;

import com.nexhire.entity.*;
import com.nexhire.enums.ApplicationStatus;
import com.nexhire.enums.BgvStatus;
import com.nexhire.enums.LifecycleStatus;
import com.nexhire.enums.UserRole;
import com.nexhire.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Seeds the database with a full end-to-end sample dataset so every screen in
 * the app has data to work with: users of each role, applications spanning
 * every {@link ApplicationStatus}, assessments, offers, joining letters, BGV
 * records, trainees at varying progress, a project allocation, asset
 * assignments and activity logs.
 *
 * Runs only when the DB is empty (users table). To reseed, drop/recreate the
 * `nexhire` database and restart the backend.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private static final String EMP_PASSWORD = "password123";

    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final JobRepository jobRepository;
    private final HiringBudgetRepository hiringBudgetRepository;
    private final TrainingSeatRepository trainingSeatRepository;
    private final ProjectRepository projectRepository;
    private final AssetRepository assetRepository;
    private final JobApplicationRepository applicationRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final OfferLetterRepository offerLetterRepository;
    private final JoiningLetterRepository joiningLetterRepository;
    private final BackgroundVerificationRepository bgvRepository;
    private final TraineeRepository traineeRepository;
    private final TrainingRecordRepository trainingRecordRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final AssetAssignmentRepository assetAssignmentRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final TrainingRepository trainingRepository;
    private final TrainingBlockRepository trainingBlockRepository;

    private final LocalDateTime now = LocalDateTime.now();

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping.");
            return;
        }

        log.info("Seeding database with full lifecycle sample data...");

        // ─── Staff users ────────────────────────────────────────────────────────
        User admin = userRepository.save(User.builder()
                .name("Admin User").email("admin@nexhire.com")
                .password(passwordEncoder.encode("admin123")).phone("9000000001")
                .role(UserRole.ADMIN).build());

        User hr = userRepository.save(User.builder()
                .name("HR Manager").email("hr@nexhire.com")
                .password(passwordEncoder.encode("hr123")).phone("9000000002")
                .role(UserRole.HR).build());

        User rmg = userRepository.save(User.builder()
                .name("RMG Manager").email("rmg@nexhire.com")
                .password(passwordEncoder.encode("rmg123")).phone("9000000003")
                .role(UserRole.RMG).build());

        // ─── Locations + budgets + training seats ─────────────────────────────────
        Location bangalore = locationRepository.save(Location.builder()
                .name("Bangalore").city("Bangalore").build());
        Location hyderabad = locationRepository.save(Location.builder()
                .name("Hyderabad").city("Hyderabad").build());

        HiringBudget blrBudget = hiringBudgetRepository.save(HiringBudget.builder()
                .location(bangalore).totalSlots(10).usedSlots(0).budgetAmount(5000000L).usedAmount(0L).build());
        HiringBudget hydBudget = hiringBudgetRepository.save(HiringBudget.builder()
                .location(hyderabad).totalSlots(8).usedSlots(0).budgetAmount(4000000L).usedAmount(0L).build());

        TrainingSeat blrSeats = trainingSeatRepository.save(TrainingSeat.builder()
                .location(bangalore).totalSeats(15).occupiedSeats(0).build());
        TrainingSeat hydSeats = trainingSeatRepository.save(TrainingSeat.builder()
                .location(hyderabad).totalSeats(10).occupiedSeats(0).build());

        // ─── Trainings & Blocks ──────────────────────────────────────────────────
        Training systemEngTraining = trainingRepository.save(Training.builder()
                .name("System Engineer Program")
                .costPerCandidate(50000.0)
                .cutoffScore(60.0)
                .minimumAttendancePercentage(75.0)
                .build());
        Training javaTraining = trainingRepository.save(Training.builder()
                .name("Java Full Stack Program")
                .costPerCandidate(60000.0)
                .cutoffScore(65.0)
                .minimumAttendancePercentage(80.0)
                .build());

        TrainingBlock blockA = trainingBlockRepository.save(TrainingBlock.builder()
                .name("Classroom Block A")
                .location(bangalore)
                .capacity(60)
                .occupiedSeats(0)
                .build());
        TrainingBlock blockB = trainingBlockRepository.save(TrainingBlock.builder()
                .name("Classroom Block B")
                .location(hyderabad)
                .capacity(60)
                .occupiedSeats(0)
                .build());

        // ─── Jobs ───────────────────────────────────────────────────────────────
        Job javaJob = jobRepository.save(Job.builder()
                .title("System Engineer")
                .description("Develop and maintain Java-based applications using Spring Boot.")
                .requirements("Java 17, Spring Boot, REST APIs, PostgreSQL")
                .location(bangalore).build());

        Job angularJob = jobRepository.save(Job.builder()
                .title("Angular Developer")
                .description("Build modern web applications using Angular framework.")
                .requirements("Angular 17+, TypeScript, HTML/CSS, REST integration")
                .location(hyderabad).build());

        Job fullStackJob = jobRepository.save(Job.builder()
                .title("Full Stack Developer")
                .description("Work on both frontend and backend of enterprise applications.")
                .requirements("Java, Angular, PostgreSQL, Docker basics")
                .location(bangalore).build());

        // ─── Projects (managed by Admin) ──────────────────────────────────────────
        Project alpha = projectRepository.save(Project.builder()
                .name("HDFC Banking Portal").description("Core banking web application with transaction processing and account management").build());
        Project beta = projectRepository.save(Project.builder()
                .name("Flipkart Logistics Platform").description("Warehouse management and last-mile delivery optimization system").build());
        projectRepository.save(Project.builder()
                .name("Infosys Cloud Migration").description("Legacy on-premise workload migration to AWS cloud infrastructure").build());

        // ─── Assets ───────────────────────────────────────────────────────────────
        Asset laptop1 = assetRepository.save(asset("Dell Latitude 5540", "LAPTOP", "DL-5540-0001"));
        Asset laptop2 = assetRepository.save(asset("Dell Latitude 5540", "LAPTOP", "DL-5540-0002"));
        Asset laptop3 = assetRepository.save(asset("MacBook Pro 14", "LAPTOP", "MBP-14-0001"));
        Asset idCard1 = assetRepository.save(asset("Employee ID Card", "ID_CARD", "IDC-0001"));
        Asset idCard2 = assetRepository.save(asset("Employee ID Card", "ID_CARD", "IDC-0002"));
        assetRepository.save(asset("Logitech Headset", "HEADSET", "LG-HS-0001"));

        // ─── Candidates across every application status ───────────────────────────
        // APPLIED
        User u1 = emp("John Candidate", "candidate1@nexhire.com", "9000000101", LifecycleStatus.CANDIDATE);
        app(u1, javaJob, ApplicationStatus.APPLIED);

        // ASSESSMENT_PENDING
        User u2 = emp("Jane Candidate", "candidate2@nexhire.com", "9000000102", LifecycleStatus.CANDIDATE);
        app(u2, angularJob, ApplicationStatus.ASSESSMENT_PENDING);

        // ASSESSMENT_COMPLETED (score recorded)
        User u3 = emp("Arjun Rao", "candidate3@nexhire.com", "9000000103", LifecycleStatus.CANDIDATE);
        JobApplication a3 = app(u3, javaJob, ApplicationStatus.ASSESSMENT_COMPLETED);
        assessment(a3, 78.5, "Strong core Java, average on system design.", hr);

        // QUALIFIED
        User u4 = emp("Meera Nair", "candidate4@nexhire.com", "9000000104", LifecycleStatus.CANDIDATE);
        JobApplication a4 = app(u4, fullStackJob, ApplicationStatus.QUALIFIED);
        assessment(a4, 88.0, "Excellent all-round performance.", hr);

        // REJECTED
        User u5 = emp("Rohit Kumar", "candidate5@nexhire.com", "9000000105", LifecycleStatus.CANDIDATE);
        JobApplication a5 = app(u5, angularJob, ApplicationStatus.REJECTED);
        assessment(a5, 41.0, "Did not meet the qualifying threshold.", hr);

        // OFFER_SENT
        User u6 = emp("Sneha Iyer", "candidate6@nexhire.com", "9000000106", LifecycleStatus.CANDIDATE);
        JobApplication a6 = app(u6, javaJob, ApplicationStatus.OFFER_SENT);
        assessment(a6, 82.0, "Good problem solving.", hr);
        offer(a6, "Offer for Java Developer at NexHire. Annual CTC 12 LPA.", hr, null);

        // OFFER_ACCEPTED (+ BGV in progress)
        User u7 = emp("Vikram Shah", "candidate7@nexhire.com", "9000000107", LifecycleStatus.CANDIDATE);
        JobApplication a7 = app(u7, fullStackJob, ApplicationStatus.OFFER_ACCEPTED);
        assessment(a7, 90.0, "Top performer.", hr);
        offer(a7, "Offer for Full Stack Developer at NexHire. Annual CTC 14 LPA.", hr, now.minusDays(2));
        bgv(a7, BgvStatus.IN_PROGRESS, "SecureCheck Pvt Ltd", "Employment history verification underway.", null);

        // OFFER_REJECTED
        User u8 = emp("Anita Desai", "candidate8@nexhire.com", "9000000108", LifecycleStatus.CANDIDATE);
        JobApplication a8 = app(u8, angularJob, ApplicationStatus.OFFER_REJECTED);
        assessment(a8, 85.0, "Accepted another offer.", hr);
        offer(a8, "Offer for Angular Developer at NexHire.", hr, now.minusDays(1));

        // JOINING_ON_HOLD
        User u9 = emp("Karan Malhotra", "candidate9@nexhire.com", "9000000109", LifecycleStatus.CANDIDATE);
        JobApplication a9 = app(u9, javaJob, ApplicationStatus.JOINING_ON_HOLD);
        a9.setHoldReason("Awaiting hiring budget availability at Bangalore.");
        a9.setHoldCreatedAt(now.minusDays(1));
        applicationRepository.save(a9);
        assessment(a9, 80.0, "Ready to join, pending resources.", hr);
        offer(a9, "Offer for Java Developer at NexHire.", hr, now.minusDays(3));
        bgv(a9, BgvStatus.CLEARED, "SecureCheck Pvt Ltd", "All checks cleared.", now.minusDays(1));

        // JOINING_LETTER_SENT (joining letter issued, awaiting candidate acceptance)
        User u10 = emp("Divya Menon", "candidate10@nexhire.com", "9000000110", LifecycleStatus.CANDIDATE);
        JobApplication a10 = app(u10, fullStackJob, ApplicationStatus.JOINING_LETTER_SENT);
        assessment(a10, 87.0, "Cleared all rounds.", hr);
        offer(a10, "Offer for Full Stack Developer at NexHire.", hr, now.minusDays(4));
        bgv(a10, BgvStatus.CLEARED, "SecureCheck Pvt Ltd", "All checks cleared.", now.minusDays(2));
        joining(a10, bangalore, hr, LocalDate.now().plusDays(7), null);

        // TRAINING_IN_PROGRESS (trainee, 45%)
        User t1 = emp("Aditya Verma", "trainee1@nexhire.com", "9000000111", LifecycleStatus.TRAINEE);
        JobApplication ta1 = app(t1, javaJob, ApplicationStatus.TRAINING_IN_PROGRESS);
        assessment(ta1, 84.0, "Cleared all rounds.", hr);
        offer(ta1, "Offer for Java Developer at NexHire.", hr, now.minusDays(20));
        bgv(ta1, BgvStatus.CLEARED, "SecureCheck Pvt Ltd", "All checks cleared.", now.minusDays(15));
        joining(ta1, bangalore, hr, LocalDate.now().minusDays(10), now.minusDays(12));
        trainee(t1, ta1, 45, "Spring Boot Fundamentals", false, now.minusDays(10));

        // TRAINING_IN_PROGRESS (trainee, 70%)
        User t2 = emp("Pooja Reddy", "trainee2@nexhire.com", "9000000112", LifecycleStatus.TRAINEE);
        JobApplication ta2 = app(t2, angularJob, ApplicationStatus.TRAINING_IN_PROGRESS);
        assessment(ta2, 81.0, "Cleared all rounds.", hr);
        offer(ta2, "Offer for Angular Developer at NexHire.", hr, now.minusDays(22));
        bgv(ta2, BgvStatus.CLEARED, "VerifyPro Solutions", "All checks cleared.", now.minusDays(16));
        joining(ta2, hyderabad, hr, LocalDate.now().minusDays(11), now.minusDays(13));
        trainee(t2, ta2, 70, "Angular Components & RxJS", false, now.minusDays(11));

        // TRAINING_COMPLETED (eligible for RMG allocation)
        User t3 = emp("Sameer Joshi", "trainee3@nexhire.com", "9000000113", LifecycleStatus.TRAINEE);
        JobApplication ta3 = app(t3, javaJob, ApplicationStatus.TRAINING_COMPLETED);
        assessment(ta3, 89.0, "Cleared all rounds.", hr);
        offer(ta3, "Offer for Java Developer at NexHire.", hr, now.minusDays(40));
        bgv(ta3, BgvStatus.CLEARED, "SecureCheck Pvt Ltd", "All checks cleared.", now.minusDays(35));
        joining(ta3, bangalore, hr, LocalDate.now().minusDays(30), now.minusDays(32));
        Trainee tr3 = trainee(t3, ta3, 100, "Spring Boot Microservices", true, now.minusDays(2));

        // TRAINING_COMPLETED (eligible for RMG allocation)
        User t4 = emp("Nisha Gupta", "trainee4@nexhire.com", "9000000114", LifecycleStatus.TRAINEE);
        JobApplication ta4 = app(t4, fullStackJob, ApplicationStatus.TRAINING_COMPLETED);
        assessment(ta4, 92.0, "Cleared all rounds.", hr);
        offer(ta4, "Offer for Full Stack Developer at NexHire.", hr, now.minusDays(42));
        bgv(ta4, BgvStatus.CLEARED, "VerifyPro Solutions", "All checks cleared.", now.minusDays(37));
        joining(ta4, bangalore, hr, LocalDate.now().minusDays(31), now.minusDays(33));
        trainee(t4, ta4, 100, "Full Stack Capstone", true, now.minusDays(1));

        // PROJECT_ASSIGNED (already allocated to Project Alpha by RMG)
        User t5 = emp("Rahul Singh", "employee1@nexhire.com", "9000000115", LifecycleStatus.PROJECT_ASSIGNED);
        JobApplication ta5 = app(t5, javaJob, ApplicationStatus.PROJECT_ASSIGNED);
        assessment(ta5, 86.0, "Cleared all rounds.", hr);
        offer(ta5, "Offer for Java Developer at NexHire.", hr, now.minusDays(70));
        bgv(ta5, BgvStatus.CLEARED, "SecureCheck Pvt Ltd", "All checks cleared.", now.minusDays(65));
        joining(ta5, bangalore, hr, LocalDate.now().minusDays(60), now.minusDays(62));
        Trainee tr5 = trainee(t5, ta5, 100, "Spring Boot Microservices", true, now.minusDays(50));
        assignToProject(tr5, alpha, rmg, now.minusDays(5));

        // ─── Asset assignments ────────────────────────────────────────────────────
        assignAsset(laptop1, t5, now.minusDays(50));   // active
        assignAsset(idCard1, t5, now.minusDays(50));   // active
        assignAsset(laptop2, t3, now.minusDays(30));   // active
        assignAsset(idCard2, t4, now.minusDays(31));   // active

        // ─── Reflect resource usage from joined people ────────────────────────────
        // 5 joined into Bangalore (t1, t3, t4, t5, u10), 1 into Hyderabad (t2).
        blrBudget.setUsedSlots(5);
        blrBudget.setUsedAmount(250000L); // 5 × ₹50,000
        hydBudget.setUsedSlots(1);
        hydBudget.setUsedAmount(50000L); // 1 × ₹50,000
        hiringBudgetRepository.save(blrBudget);
        hiringBudgetRepository.save(hydBudget);
        // Trainees currently occupying training seats (in-progress): t1 (BLR), t2 (HYD).
        blrSeats.setOccupiedSeats(3);
        hydSeats.setOccupiedSeats(2);
        trainingSeatRepository.save(blrSeats);
        trainingSeatRepository.save(hydSeats);

        // ─── Activity logs ────────────────────────────────────────────────────────
        activity(hr, "ASSESSMENT_SCORED", "HR recorded assessment score for Arjun Rao.", now.minusDays(6));
        activity(hr, "OFFER_SENT", "HR sent an offer letter to Sneha Iyer.", now.minusDays(5));
        activity(hr, "OFFER_ACCEPTED", "Vikram Shah accepted the offer.", now.minusDays(2));
        activity(hr, "BGV_INITIATED", "HR initiated background verification for Vikram Shah.", now.minusDays(2));
        activity(hr, "JOINING_LETTER_SENT", "HR sent a joining letter to Divya Menon.", now.minusDays(1));
        activity(hr, "TRAINING_COMPLETED", "Sameer Joshi completed training.", now.minusDays(2));
        activity(rmg, "PROJECT_ASSIGNED", "RMG allocated Rahul Singh to Project Alpha.", now.minusDays(5));
        activity(admin, "PROJECT_CREATED", "Admin created Project Gamma.", now.minusDays(3));
        activity(admin, "ASSET_ASSIGNED", "Admin assigned a laptop to Rahul Singh.", now.minusDays(50));

        log.info("Database seeding complete: {} users, {} applications.",
                userRepository.count(), applicationRepository.count());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Asset asset(String name, String type, String serial) {
        return Asset.builder().name(name).type(type).serialNumber(serial).build();
    }

    private User emp(String name, String email, String phone, LifecycleStatus ls) {
        return userRepository.save(User.builder()
                .name(name).email(email).password(passwordEncoder.encode(EMP_PASSWORD))
                .phone(phone).role(UserRole.EMPLOYEE).lifecycleStatus(ls).build());
    }

    private JobApplication app(User user, Job job, ApplicationStatus status) {
        return applicationRepository.save(JobApplication.builder()
                .user(user).job(job).status(status).build());
    }

    private void assessment(JobApplication application, double score, String remarks, User evaluatedBy) {
        assessmentResultRepository.save(AssessmentResult.builder()
                .application(application).score(score).remarks(remarks)
                .evaluatedBy(evaluatedBy).evaluatedAt(now.minusDays(6)).build());
    }

    private void offer(JobApplication application, String content, User sentBy, LocalDateTime respondedAt) {
        offerLetterRepository.save(OfferLetter.builder()
                .application(application).content(content).sentBy(sentBy)
                .sentAt(now.minusDays(5)).respondedAt(respondedAt).build());
    }

    private void bgv(JobApplication application, BgvStatus status, String vendor, String remarks, LocalDateTime completedAt) {
        bgvRepository.save(BackgroundVerification.builder()
                .application(application).status(status).vendorName(vendor)
                .remarks(remarks).completedAt(completedAt).build());
    }

    private void joining(JobApplication application, Location location, User sentBy, LocalDate joiningDate, LocalDateTime respondedAt) {
        joiningLetterRepository.save(JoiningLetter.builder()
                .application(application)
                .content("Joining letter for " + application.getJob().getTitle() + " at NexHire.")
                .joiningDate(joiningDate).location(location).sentBy(sentBy)
                .sentAt(now.minusDays(12)).respondedAt(respondedAt).build());
    }

    private Trainee trainee(User user, JobApplication application, int progress, String topic, boolean completed, LocalDateTime updatedAt) {
        Trainee trainee = traineeRepository.save(Trainee.builder()
                .user(user).application(application).joinedAt(now.minusDays(12)).build());
        trainingRecordRepository.save(TrainingRecord.builder()
                .trainee(trainee).progress(progress).topic(topic).completed(completed).build());
        return trainee;
    }

    private void assignToProject(Trainee trainee, Project project, User assignedBy, LocalDateTime assignedAt) {
        projectAssignmentRepository.save(ProjectAssignment.builder()
                .trainee(trainee).project(project).assignedBy(assignedBy).assignedAt(assignedAt).build());
        project.setTeamSize(project.getTeamSize() + 1);
        projectRepository.save(project);
    }

    private void assignAsset(Asset asset, User user, LocalDateTime assignedAt) {
        assetAssignmentRepository.save(AssetAssignment.builder()
                .asset(asset).user(user).assignedAt(assignedAt).active(true).build());
    }

    private void activity(User user, String actionType, String description, LocalDateTime timestamp) {
        activityLogRepository.save(ActivityLog.builder()
                .user(user).actionType(actionType).description(description).timestamp(timestamp).build());
    }
}
