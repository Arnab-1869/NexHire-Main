package com.nexhire.service;

import com.nexhire.dto.BgvResponse;
import com.nexhire.dto.BgvUpdateRequest;
import com.nexhire.dto.BgcDocumentResponse;
import com.nexhire.dto.BgcVendorRequestResponse;
import com.nexhire.entity.*;
import com.nexhire.enums.ApplicationStatus;
import com.nexhire.enums.BgvStatus;
import com.nexhire.exception.DuplicateResourceException;
import com.nexhire.exception.InvalidStateTransitionException;
import com.nexhire.exception.ResourceNotFoundException;
import com.nexhire.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BgvService {

    private final BackgroundVerificationRepository bgvRepository;
    private final JobApplicationRepository applicationRepository;
    private final BgcDocumentRepository bgcDocumentRepository;
    private final BgcVendorRequestRepository bgcVendorRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /** HR/System initiates a BGV record for an application. */
    @Transactional
    public BgvResponse initiate(Long applicationId, String vendorName) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        if (bgvRepository.existsByApplicationId(applicationId)) {
            throw new DuplicateResourceException("BGV already initiated for this application");
        }

        BackgroundVerification bgv = BackgroundVerification.builder()
                .application(application)
                .status(BgvStatus.INITIATED)
                .vendorName(vendorName)
                .build();

        application.setStatus(ApplicationStatus.BGC_INITIATED);
        applicationRepository.save(application);

        // Notify candidate to upload documents
        notificationService.notify(application.getUser().getId(), "BGC_INITIATED",
                "Background Verification Started",
                "Your background verification has been initiated. Please upload the required documents.");

        return toResponse(bgvRepository.save(bgv));
    }

    /** Candidate uploads verification documents. */
    @Transactional
    public BgcDocumentResponse uploadDocument(Long candidateId, Long applicationId, String documentType, MultipartFile file) throws IOException {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        BackgroundVerification bgv = bgvRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new InvalidStateTransitionException("BGC is not initiated for this application"));

        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        BgcDocument doc = BgcDocument.builder()
                .bgcCase(bgv)
                .candidate(candidate)
                .application(application)
                .documentType(documentType)
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .fileData(file.getBytes())
                .status("PENDING")
                .build();

        BgcDocument saved = bgcDocumentRepository.save(doc);

        // Update status of BGV case to DOCUMENTS_SUBMITTED
        bgv.setStatus(BgvStatus.DOCUMENTS_SUBMITTED);
        bgvRepository.save(bgv);

        application.setStatus(ApplicationStatus.BGC_DOCUMENTS_SUBMITTED);
        applicationRepository.save(application);

        return toDocResponse(saved);
    }

    public List<BgcDocumentResponse> getDocuments(Long bgcCaseId) {
        return bgcDocumentRepository.findByBgcCaseId(bgcCaseId).stream()
                .map(this::toDocResponse)
                .toList();
    }

    public BgcDocument getDocumentFile(Long docId) {
        return bgcDocumentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + docId));
    }

    /** HR accepts/rejects candidate documents. */
    @Transactional
    public BgcDocumentResponse reviewDocument(Long docId, String status, String remarks, Long reviewerId) {
        BgcDocument doc = bgcDocumentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));

        doc.setStatus(status); // APPROVED, REJECTED
        doc.setRemarks(remarks);
        doc.setReviewedBy(reviewer);
        doc.setReviewedAt(LocalDateTime.now());

        BgcDocument saved = bgcDocumentRepository.save(doc);

        BackgroundVerification bgv = doc.getBgcCase();
        if (status.equalsIgnoreCase("REJECTED")) {
            bgv.setStatus(BgvStatus.RECHECK_REQUIRED);
            bgvRepository.save(bgv);

            JobApplication application = bgv.getApplication();
            application.setStatus(ApplicationStatus.BGC_VERIFICATION_IN_PROGRESS);
            applicationRepository.save(application);

            notificationService.notify(doc.getCandidate().getId(), "BGC_REJECTED",
                    "Document Rejected",
                    "Your uploaded document (" + doc.getDocumentType() + ") was rejected. Reason: " + remarks);
        }

        return toDocResponse(saved);
    }

    /** HR sends BGC documents to vendor. */
    @Transactional
    public BgcVendorRequestResponse sendToVendor(Long bgcCaseId, String vendorName, String vendorLink, Long sentById) {
        BackgroundVerification bgv = bgvRepository.findById(bgcCaseId)
                .orElseThrow(() -> new ResourceNotFoundException("BGC Case not found"));

        User sentBy = userRepository.findById(sentById)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        BgcVendorRequest req = BgcVendorRequest.builder()
                .bgcCase(bgv)
                .candidate(bgv.getApplication().getUser())
                .application(bgv.getApplication())
                .vendorName(vendorName)
                .vendorLink(vendorLink)
                .requestPayload("BGC Case ID: " + bgcCaseId + ", Candidate: " + bgv.getApplication().getUser().getName())
                .sentBy(sentBy)
                .status("SENT")
                .build();

        bgv.setStatus(BgvStatus.VERIFICATION_IN_PROGRESS);
        bgv.setVendorName(vendorName);
        bgvRepository.save(bgv);

        JobApplication application = bgv.getApplication();
        application.setStatus(ApplicationStatus.BGC_VERIFICATION_IN_PROGRESS);
        applicationRepository.save(application);

        return toVendorResponse(bgcVendorRequestRepository.save(req));
    }

    public List<BgcVendorRequestResponse> getVendorRequests(Long bgcCaseId) {
        return bgcVendorRequestRepository.findByBgcCaseId(bgcCaseId).stream()
                .map(this::toVendorResponse)
                .toList();
    }

    /** HR lists all BGV records. */
    public List<BgvResponse> getAll() {
        return bgvRepository.findAll().stream().map(this::toResponse).toList();
    }

    /** Candidate views own BGV records. */
    public List<BgvResponse> getMine(Long userId) {
        return bgvRepository.findByApplicationUserId(userId).stream().map(this::toResponse).toList();
    }

    public BgvResponse getByApplication(Long applicationId) {
        BackgroundVerification bgv = bgvRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("BGV not found for application: " + applicationId));
        return toResponse(bgv);
    }

    /** Update BGV status (Excel upload or webhook). */
    @Transactional
    public BgvResponse updateStatus(Long id, BgvUpdateRequest request) {
        BackgroundVerification bgv = bgvRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BGV not found with id: " + id));

        BgvStatus newStatus;
        try {
            newStatus = BgvStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid BGV status: " + request.getStatus());
        }

        bgv.setStatus(newStatus);
        if (request.getRemarks() != null) {
            bgv.setRemarks(request.getRemarks());
        }
        if (request.getVendorName() != null) {
            bgv.setVendorName(request.getVendorName());
        }
        if (newStatus == BgvStatus.CLEARED || newStatus == BgvStatus.FAILED) {
            bgv.setCompletedAt(LocalDateTime.now());
        }

        BackgroundVerification saved = bgvRepository.save(bgv);

        // Immediate Employee & SelectedUser creation if CLEARED
        if (newStatus == BgvStatus.CLEARED) {
            JobApplication application = saved.getApplication();
            application.setStatus(ApplicationStatus.BGC_CLEARED);
            applicationRepository.save(application);

            // Import/Trigger the exact immediate transactional selected_user creation
            createEmployeeAndSelectedUserDirectly(application);
        } else if (newStatus == BgvStatus.FAILED) {
            JobApplication application = saved.getApplication();
            application.setStatus(ApplicationStatus.BGC_FAILED);
            applicationRepository.save(application);
        }

        return toResponse(saved);
    }

    private void createEmployeeAndSelectedUserDirectly(JobApplication application) {
        if (employeeRepository.existsByApplicationId(application.getId())) {
            return;
        }
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

        User user = application.getUser();
        user.setLifecycleStatus(LifecycleStatus.CANDIDATE);
        userRepository.save(user);

        application.setStatus(ApplicationStatus.SELECTED_USER_CREATED);
        applicationRepository.save(application);
    }

    private final EmployeeRepository employeeRepository;
    private final SelectedUserRepository selectedUserRepository;

    private BgvResponse toResponse(BackgroundVerification bgv) {
        JobApplication app = bgv.getApplication();
        return BgvResponse.builder()
                .id(bgv.getId())
                .applicationId(app.getId())
                .userId(app.getUser().getId())
                .candidateName(app.getUser().getName())
                .candidateEmail(app.getUser().getEmail())
                .jobTitle(app.getJob().getTitle())
                .status(bgv.getStatus().name())
                .vendorName(bgv.getVendorName())
                .remarks(bgv.getRemarks())
                .initiatedAt(bgv.getInitiatedAt())
                .completedAt(bgv.getCompletedAt())
                .updatedAt(bgv.getUpdatedAt())
                .build();
    }

    private BgcDocumentResponse toDocResponse(BgcDocument doc) {
        return BgcDocumentResponse.builder()
                .id(doc.getId())
                .bgcCaseId(doc.getBgcCase().getId())
                .candidateId(doc.getCandidate().getId())
                .candidateName(doc.getCandidate().getName())
                .applicationId(doc.getApplication().getId())
                .documentType(doc.getDocumentType())
                .fileName(doc.getFileName())
                .fileType(doc.getFileType())
                .fileSize(doc.getFileSize())
                .status(doc.getStatus())
                .remarks(doc.getRemarks())
                .uploadedAt(doc.getUploadedAt())
                .reviewedByName(doc.getReviewedBy() != null ? doc.getReviewedBy().getName() : null)
                .reviewedAt(doc.getReviewedAt())
                .build();
    }

    private BgcVendorRequestResponse toVendorResponse(BgcVendorRequest req) {
        return BgcVendorRequestResponse.builder()
                .id(req.getId())
                .bgcCaseId(req.getBgcCase().getId())
                .candidateId(req.getCandidate().getId())
                .applicationId(req.getApplication().getId())
                .vendorName(req.getVendorName())
                .vendorLink(req.getVendorLink())
                .sentByName(req.getSentBy().getName())
                .sentAt(req.getSentAt())
                .status(req.getStatus())
                .remarks(req.getRemarks())
                .build();
    }
}
