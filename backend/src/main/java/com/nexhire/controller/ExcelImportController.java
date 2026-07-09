package com.nexhire.controller;

import com.nexhire.dto.UploadSummaryResponse;
import com.nexhire.entity.BulkUploadErrorRow;
import com.nexhire.entity.BulkUploadLog;
import com.nexhire.repository.BulkUploadErrorRowRepository;
import com.nexhire.repository.BulkUploadLogRepository;
import com.nexhire.service.ExcelImportService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HR')")
public class ExcelImportController {

    private final ExcelImportService importService;
    private final BulkUploadLogRepository logRepository;
    private final BulkUploadErrorRowRepository errorRowRepository;

    @PostMapping("/assessment")
    public ResponseEntity<UploadSummaryResponse> uploadAssessment(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "cutoff", required = false) Double cutoff,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(importService.importAssessmentResults(file, userId, cutoff));
    }

    @PostMapping("/bgc")
    public ResponseEntity<UploadSummaryResponse> uploadBgc(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(importService.importBgcResults(file, userId));
    }

    @PostMapping("/training/{batchId}")
    public ResponseEntity<UploadSummaryResponse> uploadTraining(
            @PathVariable Long batchId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(importService.importTraineeResults(batchId, file, userId));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<BulkUploadLog>> getLogs(@RequestParam(value = "type", required = false) String type) {
        if (type != null) {
            return ResponseEntity.ok(logRepository.findByUploadTypeOrderByUploadedAtDesc(type));
        }
        return ResponseEntity.ok(logRepository.findAll());
    }

    @GetMapping("/logs/{logId}/errors")
    public ResponseEntity<List<BulkUploadErrorRow>> getLogErrors(@PathVariable Long logId) {
        return ResponseEntity.ok(errorRowRepository.findByUploadLogId(logId));
    }

    @GetMapping("/template/assessment")
    public ResponseEntity<byte[]> downloadAssessmentTemplate() throws IOException {
        String[] headers = {"ApplicationId", "CandidateEmail", "Score", "Result", "Remarks"};
        byte[] bytes = generateTemplateExcel("AssessmentTemplate", headers);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Assessment_Template.xlsx\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(bytes);
    }

    @GetMapping("/template/bgc")
    public ResponseEntity<byte[]> downloadBgcTemplate() throws IOException {
        String[] headers = {"ApplicationId", "CandidateEmail", "BGCStatus", "Remarks"};
        byte[] bytes = generateTemplateExcel("BgcTemplate", headers);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"BGC_Template.xlsx\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(bytes);
    }

    @GetMapping("/template/training")
    public ResponseEntity<byte[]> downloadTrainingTemplate() throws IOException {
        String[] headers = {"EmployeeId", "TraineeId", "Score", "AttendancePercentage", "FinalResult", "Remarks"};
        byte[] bytes = generateTemplateExcel("TrainingTemplate", headers);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Training_Template.xlsx\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(bytes);
    }

    private byte[] generateTemplateExcel(String name, String[] headers) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(name);
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }
            workbook.write(baos);
            return baos.toByteArray();
        }
    }
}
