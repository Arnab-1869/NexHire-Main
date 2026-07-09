package com.nexhire.service;

import com.nexhire.dto.RowErrorDto;
import com.nexhire.dto.UploadSummaryResponse;
import com.nexhire.entity.*;
import com.nexhire.enums.ApplicationStatus;
import com.nexhire.enums.BgvStatus;
import com.nexhire.enums.LifecycleStatus;
import com.nexhire.exception.ResourceNotFoundException;
import com.nexhire.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExcelImportService {

    private final JobApplicationRepository applicationRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final BackgroundVerificationRepository bgvRepository;
    private final TraineeRepository traineeRepository;
    private final UserRepository userRepository;
    private final BulkUploadLogRepository uploadLogRepository;
    private final BulkUploadErrorRowRepository uploadErrorRowRepository;
    private final EmployeeRepository employeeRepository;
    private final SelectedUserRepository selectedUserRepository;
    private final JoiningBatchRepository joiningBatchRepository;
    private final OfferLetterRepository offerLetterRepository;

    @Transactional
    public UploadSummaryResponse importAssessmentResults(MultipartFile file, Long uploadedById, Double cutoff) {
        User uploader = userRepository.findById(uploadedById)
                .orElseThrow(() -> new ResourceNotFoundException("Uploader user not found"));

        BulkUploadLog log = uploadLogRepository.save(BulkUploadLog.builder()
                .uploadType("ASSESSMENT")
                .fileName(file.getOriginalFilename())
                .uploadedBy(uploader)
                .status("IN_PROGRESS")
                .build());

        List<RowErrorDto> errorRows = new ArrayList<>();
        int totalRows = 0;
        int successRows = 0;

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.rowIterator();

            // Skip Header
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }

            double activeCutoff = cutoff != null ? cutoff : 50.0;

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                totalRows++;
                int rowNum = row.getRowNum() + 1;

                try {
                    String appIdStr = getCellValueAsString(row.getCell(0));
                    String email = getCellValueAsString(row.getCell(1));
                    String scoreStr = getCellValueAsString(row.getCell(2));
                    String resultStr = getCellValueAsString(row.getCell(3));
                    String remarks = getCellValueAsString(row.getCell(4));

                    if (appIdStr.isEmpty() || email.isEmpty()) {
                        throw new IllegalArgumentException("ApplicationId and CandidateEmail are required.");
                    }

                    Long applicationId;
                    try {
                        applicationId = (long) Double.parseDouble(appIdStr);
                    } catch (NumberFormatException e) {
                        throw new IllegalArgumentException("ApplicationId must be numeric.");
                    }

                    Double score;
                    try {
                        score = Double.parseDouble(scoreStr);
                    } catch (NumberFormatException e) {
                        throw new IllegalArgumentException("Score must be numeric.");
                    }

                    JobApplication application = applicationRepository.findById(applicationId)
                            .orElseThrow(() -> new IllegalArgumentException("Application ID does not exist."));

                    if (!application.getUser().getEmail().equalsIgnoreCase(email)) {
                        throw new IllegalArgumentException("Candidate email does not match application user email.");
                    }

                    // Save assessment result
                    AssessmentResult res = assessmentResultRepository.findByApplicationId(applicationId)
                            .orElse(AssessmentResult.builder().application(application).build());

                    res.setScore(score);
                    res.setRemarks(remarks);
                    res.setEvaluatedBy(uploader);
                    res.setEvaluatedAt(LocalDateTime.now());
                    assessmentResultRepository.save(res);

                    // Update Application status
                    boolean isPassed = resultStr.equalsIgnoreCase("PASSED") || score >= activeCutoff;
                    if (isPassed) {
                        application.setStatus(ApplicationStatus.OFFER_GENERATED);
                        
                        // Automatically generate offer letter if not present
                        if (!offerLetterRepository.findByApplicationId(application.getId()).isPresent()) {
                            OfferLetter offer = OfferLetter.builder()
                                    .application(application)
                                    .content("Dear " + application.getUser().getName() + ",\n\nWe are pleased to offer you the position of System Engineer at NexHire. Your role will be System Engineer.")
                                    .sentBy(uploader)
                                    .sentAt(LocalDateTime.now())
                                    .build();
                            offerLetterRepository.save(offer);
                        }
                    } else {
                        application.setStatus(ApplicationStatus.REJECTED);
                    }
                    applicationRepository.save(application);

                    successRows++;
                } catch (Exception e) {
                    errorRows.add(RowErrorDto.builder()
                            .rowNumber(rowNum)
                            .identifier("Row " + rowNum)
                            .errorMessage(e.getMessage())
                            .build());

                    uploadErrorRowRepository.save(BulkUploadErrorRow.builder()
                            .uploadLog(log)
                            .rowNumber(rowNum)
                            .identifier("Row " + rowNum)
                            .errorMessage(e.getMessage())
                            .build());
                }
            }

            log.setStatus(errorRows.isEmpty() ? "COMPLETED" : "COMPLETED_WITH_ERRORS");
            log.setTotalRows(totalRows);
            log.setSuccessRows(successRows);
            log.setFailedRows(errorRows.size());
            uploadLogRepository.save(log);

        } catch (Exception e) {
            log.setStatus("FAILED");
            log.setRemarks(e.getMessage());
            uploadLogRepository.save(log);
        }

        return UploadSummaryResponse.builder()
                .logId(log.getId())
                .uploadType("ASSESSMENT")
                .fileName(log.getFileName())
                .totalRows(totalRows)
                .successRows(successRows)
                .failedRows(errorRows.size())
                .status(log.getStatus())
                .errors(errorRows)
                .build();
    }

    @Transactional
    public UploadSummaryResponse importBgcResults(MultipartFile file, Long uploadedById) {
        User uploader = userRepository.findById(uploadedById)
                .orElseThrow(() -> new ResourceNotFoundException("Uploader user not found"));

        BulkUploadLog log = uploadLogRepository.save(BulkUploadLog.builder()
                .uploadType("BGC")
                .fileName(file.getOriginalFilename())
                .uploadedBy(uploader)
                .status("IN_PROGRESS")
                .build());

        List<RowErrorDto> errorRows = new ArrayList<>();
        int totalRows = 0;
        int successRows = 0;

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.rowIterator();

            // Skip Header
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                totalRows++;
                int rowNum = row.getRowNum() + 1;

                try {
                    String appIdStr = getCellValueAsString(row.getCell(0));
                    String email = getCellValueAsString(row.getCell(1));
                    String bgcStatusStr = getCellValueAsString(row.getCell(2)).toUpperCase();
                    String remarks = getCellValueAsString(row.getCell(3));

                    if (appIdStr.isEmpty() || email.isEmpty() || bgcStatusStr.isEmpty()) {
                        throw new IllegalArgumentException("ApplicationId, CandidateEmail and BGCStatus are required.");
                    }

                    Long applicationId;
                    try {
                        applicationId = (long) Double.parseDouble(appIdStr);
                    } catch (NumberFormatException e) {
                        throw new IllegalArgumentException("ApplicationId must be numeric.");
                    }

                    JobApplication application = applicationRepository.findById(applicationId)
                            .orElseThrow(() -> new IllegalArgumentException("Application ID does not exist."));

                    if (!application.getUser().getEmail().equalsIgnoreCase(email)) {
                        throw new IllegalArgumentException("Candidate email does not match application user email.");
                    }

                    BackgroundVerification bgc = bgvRepository.findByApplicationId(applicationId)
                            .orElseGet(() -> BackgroundVerification.builder()
                                    .application(application)
                                    .status(BgvStatus.INITIATED)
                                    .build());

                    BgvStatus targetStatus;
                    if (bgcStatusStr.equals("CLEARED") || bgcStatusStr.equals("PASSED") || bgcStatusStr.equals("VERIFIED")) {
                        targetStatus = BgvStatus.CLEARED;
                        bgc.setCompletedAt(LocalDateTime.now());
                    } else if (bgcStatusStr.equals("FAILED")) {
                        targetStatus = BgvStatus.FAILED;
                        bgc.setCompletedAt(LocalDateTime.now());
                    } else if (bgcStatusStr.equals("PENDING") || bgcStatusStr.equals("IN_PROGRESS") || bgcStatusStr.equals("VERIFICATION_IN_PROGRESS")) {
                        targetStatus = BgvStatus.VERIFICATION_IN_PROGRESS;
                    } else if (bgcStatusStr.equals("RECHECK") || bgcStatusStr.equals("RECHECK_REQUIRED")) {
                        targetStatus = BgvStatus.RECHECK_REQUIRED;
                    } else {
                        throw new IllegalArgumentException("Invalid BGCStatus: " + bgcStatusStr);
                    }

                    bgc.setStatus(targetStatus);
                    bgc.setRemarks(remarks);
                    bgvRepository.save(bgc);

                    // Update Application status
                    if (targetStatus == BgvStatus.CLEARED) {
                        application.setStatus(ApplicationStatus.BGC_CLEARED);
                        applicationRepository.save(application);

                        // Transactional Employee & Selected User creation
                        createEmployeeAndSelectedUser(application);
                    } else if (targetStatus == BgvStatus.FAILED) {
                        application.setStatus(ApplicationStatus.BGC_FAILED);
                        applicationRepository.save(application);
                    } else if (targetStatus == BgvStatus.RECHECK_REQUIRED) {
                        application.setStatus(ApplicationStatus.BGC_VERIFICATION_IN_PROGRESS);
                        applicationRepository.save(application);
                    }
                    
                    successRows++;
                } catch (Exception e) {
                    errorRows.add(RowErrorDto.builder()
                            .rowNumber(rowNum)
                            .identifier("Row " + rowNum)
                            .errorMessage(e.getMessage())
                            .build());

                    uploadErrorRowRepository.save(BulkUploadErrorRow.builder()
                            .uploadLog(log)
                            .rowNumber(rowNum)
                            .identifier("Row " + rowNum)
                            .errorMessage(e.getMessage())
                            .build());
                }
            }

            log.setStatus(errorRows.isEmpty() ? "COMPLETED" : "COMPLETED_WITH_ERRORS");
            log.setTotalRows(totalRows);
            log.setSuccessRows(successRows);
            log.setFailedRows(errorRows.size());
            uploadLogRepository.save(log);

        } catch (Exception e) {
            log.setStatus("FAILED");
            log.setRemarks(e.getMessage());
            uploadLogRepository.save(log);
        }

        return UploadSummaryResponse.builder()
                .logId(log.getId())
                .uploadType("BGC")
                .fileName(log.getFileName())
                .totalRows(totalRows)
                .successRows(successRows)
                .failedRows(errorRows.size())
                .status(log.getStatus())
                .errors(errorRows)
                .build();
    }

    @Transactional
    public void createEmployeeAndSelectedUser(JobApplication application) {
        if (employeeRepository.existsByApplicationId(application.getId())) {
            return; // Already created
        }

        // Generate next employee ID, e.g. EMP10001
        Integer nextNum = employeeRepository.findMaxEmployeeIdNumeric() + 1;
        String empId = "EMP" + nextNum;

        Employee employee = Employee.builder()
                .employeeId(empId)
                .user(application.getUser())
                .application(application)
                .build();
        employeeRepository.save(employee);

        if (!selectedUserRepository.existsByUserId(application.getUser().getId())) {
            SelectedUser selectedUser = SelectedUser.builder()
                    .user(application.getUser())
                    .application(application)
                    .employeeId(empId)
                    .build();
            selectedUserRepository.save(selectedUser);
        }

        // Also update User Lifecycle to EMPLOYEE_CREATED or candidate state
        User user = application.getUser();
        user.setLifecycleStatus(LifecycleStatus.CANDIDATE);
        userRepository.save(user);

        application.setStatus(ApplicationStatus.SELECTED_USER_CREATED);
        applicationRepository.save(application);
    }

    @Transactional
    public UploadSummaryResponse importTraineeResults(Long batchId, MultipartFile file, Long uploadedById) {
        User uploader = userRepository.findById(uploadedById)
                .orElseThrow(() -> new ResourceNotFoundException("Uploader user not found"));

        JoiningBatch batch = joiningBatchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Joining batch not found: " + batchId));

        BulkUploadLog log = uploadLogRepository.save(BulkUploadLog.builder()
                .uploadType("TRAINING")
                .fileName(file.getOriginalFilename())
                .uploadedBy(uploader)
                .status("IN_PROGRESS")
                .remarks("Batch: " + batch.getBatchName())
                .build());

        List<RowErrorDto> errorRows = new ArrayList<>();
        int totalRows = 0;
        int successRows = 0;

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.rowIterator();

            // Skip Header
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                totalRows++;
                int rowNum = row.getRowNum() + 1;

                try {
                    String empId = getCellValueAsString(row.getCell(0));
                    String traineeIdStr = getCellValueAsString(row.getCell(1));
                    String scoreStr = getCellValueAsString(row.getCell(2));
                    String attStr = getCellValueAsString(row.getCell(3));
                    String finalResult = getCellValueAsString(row.getCell(4)).toUpperCase();
                    String remarks = getCellValueAsString(row.getCell(5));

                    if (empId.isEmpty() || traineeIdStr.isEmpty()) {
                        throw new IllegalArgumentException("EmployeeId and TraineeId are required.");
                    }

                    Long traineeId;
                    try {
                        traineeId = (long) Double.parseDouble(traineeIdStr);
                    } catch (NumberFormatException e) {
                        throw new IllegalArgumentException("TraineeId must be numeric.");
                    }

                    Double score = scoreStr.isEmpty() ? 0.0 : Double.parseDouble(scoreStr);
                    Double attendance = attStr.isEmpty() ? 0.0 : Double.parseDouble(attStr);

                    Trainee trainee = traineeRepository.findById(traineeId)
                            .orElseThrow(() -> new IllegalArgumentException("Trainee ID does not exist: " + traineeId));

                    if (!empId.equalsIgnoreCase(trainee.getEmployeeId())) {
                        throw new IllegalArgumentException("Employee ID does not match trainee's employee ID.");
                    }

                    if (!Objects.equals(trainee.getBatchId(), batchId)) {
                        throw new IllegalArgumentException("Trainee does not belong to this training batch.");
                    }

                    trainee.setScore(score);
                    trainee.setAttendancePercentage(attendance);
                    trainee.setRemarks(remarks);

                    // Cutoff checking
                    double minScore = batch.getTraining().getCutoffScore();
                    double minAttendance = batch.getTraining().getMinimumAttendancePercentage();

                    if (finalResult.equals("PASSED") || finalResult.equals("COMPLETED")) {
                        trainee.setFinalResult("PASSED");
                        trainee.setStatus("COMPLETED");
                        trainee.setLapEnabled(false);
                    } else if (finalResult.equals("FAILED")) {
                        trainee.setFinalResult("FAILED");
                        trainee.setStatus("FAILED");
                        trainee.setLapEnabled(false);
                    } else if (finalResult.equals("LAP")) {
                        trainee.setFinalResult("LAP");
                        trainee.setStatus("LAP");
                        trainee.setLapEnabled(true);
                    } else {
                        // Auto evaluate
                        if (score >= minScore && attendance >= minAttendance) {
                            trainee.setFinalResult("PASSED");
                            trainee.setStatus("COMPLETED");
                            trainee.setLapEnabled(false);
                        } else {
                            trainee.setFinalResult("LAP");
                            trainee.setStatus("LAP");
                            trainee.setLapEnabled(true);
                        }
                    }

                    traineeRepository.save(trainee);
                    successRows++;
                } catch (Exception e) {
                    errorRows.add(RowErrorDto.builder()
                            .rowNumber(rowNum)
                            .identifier("Row " + rowNum)
                            .errorMessage(e.getMessage())
                            .build());

                    uploadErrorRowRepository.save(BulkUploadErrorRow.builder()
                            .uploadLog(log)
                            .rowNumber(rowNum)
                            .identifier("Row " + rowNum)
                            .errorMessage(e.getMessage())
                            .build());
                }
            }

            log.setStatus(errorRows.isEmpty() ? "COMPLETED" : "COMPLETED_WITH_ERRORS");
            log.setTotalRows(totalRows);
            log.setSuccessRows(successRows);
            log.setFailedRows(errorRows.size());
            uploadLogRepository.save(log);

        } catch (Exception e) {
            log.setStatus("FAILED");
            log.setRemarks(e.getMessage());
            uploadLogRepository.save(log);
        }

        return UploadSummaryResponse.builder()
                .logId(log.getId())
                .uploadType("TRAINING")
                .fileName(log.getFileName())
                .totalRows(totalRows)
                .successRows(successRows)
                .failedRows(errorRows.size())
                .status(log.getStatus())
                .errors(errorRows)
                .build();
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                double val = cell.getNumericCellValue();
                if (val == (long) val) {
                    return String.valueOf((long) val);
                }
                return String.valueOf(val);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return "";
        }
    }
}
