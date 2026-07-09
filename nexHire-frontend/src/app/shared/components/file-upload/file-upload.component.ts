import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { HttpClient, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface UploadResult {
  fileId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
}

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss'],
    standalone: false
})
export class FileUploadComponent implements OnDestroy {
  @Input() allowedTypes: string[] = [];
  @Input() maxSizeMB: number = 10;
  @Input() multiple: boolean = false;
  @Input() label: string = 'Upload File';
  @Input() uploadUrl: string = '/api/upload';
  
  @Output() fileSelected = new EventEmitter<File[]>();
  @Output() uploadComplete = new EventEmitter<UploadResult>();
  @Output() uploadError = new EventEmitter<string>();
  
  uploadProgress$ = new BehaviorSubject<number>(0);
  isDragOver = false;
  selectedFiles: File[] = [];
  errorMessage: string = '';
  isUploading = false;
  
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]): void {
    this.errorMessage = '';
    
    // Validate multiple file upload
    if (!this.multiple && files.length > 1) {
      this.errorMessage = 'Only single file upload is allowed';
      this.uploadError.emit(this.errorMessage);
      return;
    }

    // Filter files based on validation
    const validFiles: File[] = [];
    
    for (const file of files) {
      const validation = this.validateFile(file);
      if (!validation.valid) {
        this.errorMessage = validation.error || 'Invalid file';
        this.uploadError.emit(this.errorMessage);
        return;
      }
      validFiles.push(file);
    }

    this.selectedFiles = validFiles;
    this.fileSelected.emit(this.selectedFiles);
  }

  private validateFile(file: File): { valid: boolean; error?: string } {
    // Validate file type
    if (this.allowedTypes.length > 0) {
      const fileType = file.type;
      const isTypeAllowed = this.allowedTypes.some(type => {
        // Handle wildcard types like 'image/*'
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return fileType.startsWith(category + '/');
        }
        return fileType === type;
      });

      if (!isTypeAllowed) {
        return {
          valid: false,
          error: `File type not allowed. Allowed types: ${this.allowedTypes.join(', ')}`
        };
      }
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > this.maxSizeMB) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.maxSizeMB} MB`
      };
    }

    return { valid: true };
  }

  uploadFiles(): void {
    if (this.selectedFiles.length === 0) {
      this.errorMessage = 'No files selected';
      this.uploadError.emit(this.errorMessage);
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';
    this.uploadProgress$.next(0);

    const formData = new FormData();
    this.selectedFiles.forEach((file, index) => {
      formData.append(this.multiple ? `files[${index}]` : 'file', file);
    });

    this.http.post(this.uploadUrl, formData, {
      reportProgress: true,
      observe: 'events'
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            this.uploadProgress$.next(progress);
          }
        } else if (event.type === HttpEventType.Response) {
          this.isUploading = false;
          this.uploadProgress$.next(100);
          
          const result: UploadResult = {
            fileId: (event.body as any)?.fileId || this.generateFileId(),
            fileName: this.selectedFiles[0].name,
            fileUrl: (event.body as any)?.fileUrl || '',
            uploadedAt: new Date()
          };
          
          this.uploadComplete.emit(result);
          this.clearSelection();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isUploading = false;
        this.uploadProgress$.next(0);
        const errorMsg = error.error?.message || 'File upload failed';
        this.errorMessage = errorMsg;
        this.uploadError.emit(errorMsg);
      }
    });
  }

  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  clearSelection(): void {
    this.selectedFiles = [];
    this.errorMessage = '';
    this.uploadProgress$.next(0);
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    if (this.selectedFiles.length === 0) {
      this.errorMessage = '';
    }
  }

  get acceptAttribute(): string {
    return this.allowedTypes.join(',');
  }
}
