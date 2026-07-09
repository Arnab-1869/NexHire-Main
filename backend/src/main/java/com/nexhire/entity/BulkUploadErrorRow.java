package com.nexhire.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bulk_upload_error_rows")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkUploadErrorRow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upload_log_id", nullable = false)
    private BulkUploadLog uploadLog;

    @Column(nullable = false)
    private Integer rowNumber;

    private String identifier;

    @Column(nullable = false)
    private String errorMessage;

    @Lob
    private String rawData;
}
