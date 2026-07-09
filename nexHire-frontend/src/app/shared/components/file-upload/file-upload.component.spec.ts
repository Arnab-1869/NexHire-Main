import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpEventType, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FileUploadComponent, UploadResult } from './file-upload.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [FileUploadComponent],
    imports: [MatIconModule,
        MatButtonModule,
        MatProgressBarModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.allowedTypes).toEqual([]);
      expect(component.maxSizeMB).toBe(10);
      expect(component.multiple).toBe(false);
      expect(component.label).toBe('Upload File');
      expect(component.uploadUrl).toBe('/api/upload');
    });

    it('should initialize with empty selected files', () => {
      expect(component.selectedFiles).toEqual([]);
    });

    it('should initialize upload progress to 0', (done) => {
      component.uploadProgress$.subscribe(progress => {
        expect(progress).toBe(0);
        done();
      });
    });

    it('should not be in drag over state', () => {
      expect(component.isDragOver).toBe(false);
    });
  });

  describe('Drag and Drop Events', () => {
    it('should set isDragOver to true on dragover event', () => {
      const event = new DragEvent('dragover');
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');

      component.onDragOver(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.isDragOver).toBe(true);
    });

    it('should set isDragOver to false on dragleave event', () => {
      component.isDragOver = true;
      const event = new DragEvent('dragleave');
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');

      component.onDragLeave(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.isDragOver).toBe(false);
    });

    it('should handle file drop and set isDragOver to false', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const event = new DragEvent('drop', { dataTransfer });
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');
      spyOn(component.fileSelected, 'emit');

      component.onDrop(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.isDragOver).toBe(false);
      expect(component.selectedFiles.length).toBe(1);
      expect(component.fileSelected.emit).toHaveBeenCalledWith([file]);
    });
  });

  describe('File Selection', () => {
    it('should handle file selection from input', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const input = document.createElement('input');
      input.type = 'file';
      input.files = dataTransfer.files;

      const event = { target: input } as any;
      spyOn(component.fileSelected, 'emit');

      component.onFileSelected(event);

      expect(component.selectedFiles.length).toBe(1);
      expect(component.selectedFiles[0]).toBe(file);
      expect(component.fileSelected.emit).toHaveBeenCalledWith([file]);
    });

    it('should emit fileSelected event with selected files', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      spyOn(component.fileSelected, 'emit');

      component['handleFiles']([file]);

      expect(component.fileSelected.emit).toHaveBeenCalledWith([file]);
    });

    it('should reject multiple files when multiple is false', () => {
      component.multiple = false;
      const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
      spyOn(component.uploadError, 'emit');

      component['handleFiles']([file1, file2]);

      expect(component.errorMessage).toBe('Only single file upload is allowed');
      expect(component.uploadError.emit).toHaveBeenCalledWith('Only single file upload is allowed');
      expect(component.selectedFiles.length).toBe(0);
    });

    it('should accept multiple files when multiple is true', () => {
      component.multiple = true;
      const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
      spyOn(component.fileSelected, 'emit');

      component['handleFiles']([file1, file2]);

      expect(component.selectedFiles.length).toBe(2);
      expect(component.fileSelected.emit).toHaveBeenCalledWith([file1, file2]);
    });
  });

  describe('File Type Validation', () => {
    it('should accept file with allowed MIME type', () => {
      component.allowedTypes = ['application/pdf'];
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      const result = component['validateFile'](file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject file with disallowed MIME type', () => {
      component.allowedTypes = ['application/pdf'];
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      const result = component['validateFile'](file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('File type not allowed');
    });

    it('should accept file with wildcard MIME type', () => {
      component.allowedTypes = ['image/*'];
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      const result = component['validateFile'](file);

      expect(result.valid).toBe(true);
    });

    it('should reject file not matching wildcard MIME type', () => {
      component.allowedTypes = ['image/*'];
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      const result = component['validateFile'](file);

      expect(result.valid).toBe(false);
    });

    it('should accept any file type when allowedTypes is empty', () => {
      component.allowedTypes = [];
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      const result = component['validateFile'](file);

      expect(result.valid).toBe(true);
    });

    it('should display error message for invalid file type', () => {
      component.allowedTypes = ['application/pdf'];
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      spyOn(component.uploadError, 'emit');

      component['handleFiles']([file]);

      expect(component.errorMessage).toContain('File type not allowed');
      expect(component.uploadError.emit).toHaveBeenCalled();
    });
  });

  describe('File Size Validation', () => {
    it('should accept file within size limit', () => {
      component.maxSizeMB = 10;
      const content = new Array(5 * 1024 * 1024).join('a'); // 5MB
      const file = new File([content], 'test.txt', { type: 'text/plain' });

      const result = component['validateFile'](file);

      expect(result.valid).toBe(true);
    });

    it('should reject file exceeding size limit', () => {
      component.maxSizeMB = 5;
      const content = new Array(10 * 1024 * 1024).join('a'); // 10MB
      const file = new File([content], 'test.txt', { type: 'text/plain' });

      const result = component['validateFile'](file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('File size exceeds maximum allowed size of 5 MB');
    });

    it('should display error message for file exceeding size limit', () => {
      component.maxSizeMB = 1;
      const content = new Array(2 * 1024 * 1024).join('a'); // 2MB
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      spyOn(component.uploadError, 'emit');

      component['handleFiles']([file]);

      expect(component.errorMessage).toBe('File size exceeds maximum allowed size of 1 MB');
      expect(component.uploadError.emit).toHaveBeenCalledWith('File size exceeds maximum allowed size of 1 MB');
    });
  });

  describe('File Upload', () => {
    it('should upload file with progress tracking', (done) => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      component.selectedFiles = [file];

      const progressValues: number[] = [];
      component.uploadProgress$.subscribe(progress => {
        progressValues.push(progress);
      });

      component.uploadFiles();

      const req = httpMock.expectOne('/api/upload');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);

      // Simulate upload progress
      req.event({
        type: HttpEventType.UploadProgress,
        loaded: 50,
        total: 100
      });

      req.event({
        type: HttpEventType.UploadProgress,
        loaded: 100,
        total: 100
      });

      req.event({
        type: HttpEventType.Response,
        body: {
          fileId: 'file123',
          fileUrl: 'http://example.com/file123'
        }
      } as any);

      setTimeout(() => {
        expect(progressValues).toContain(50);
        expect(progressValues).toContain(100);
        expect(component.isUploading).toBe(false);
        done();
      }, 100);
    });

    it('should emit uploadComplete event on successful upload', (done) => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      component.selectedFiles = [file];

      component.uploadComplete.subscribe((result: UploadResult) => {
        expect(result.fileId).toBe('file123');
        expect(result.fileName).toBe('test.txt');
        expect(result.fileUrl).toBe('http://example.com/file123');
        expect(result.uploadedAt).toBeInstanceOf(Date);
        done();
      });

      component.uploadFiles();

      const req = httpMock.expectOne('/api/upload');
      req.flush({
        fileId: 'file123',
        fileUrl: 'http://example.com/file123'
      });
    });

    it('should emit uploadError event on upload failure', (done) => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      component.selectedFiles = [file];

      component.uploadError.subscribe((error: string) => {
        expect(error).toContain('File upload failed');
        expect(component.isUploading).toBe(false);
        done();
      });

      component.uploadFiles();

      const req = httpMock.expectOne('/api/upload');
      req.error(new ProgressEvent('error'));
    });

    it('should display error when no files are selected for upload', () => {
      component.selectedFiles = [];
      spyOn(component.uploadError, 'emit');

      component.uploadFiles();

      expect(component.errorMessage).toBe('No files selected');
      expect(component.uploadError.emit).toHaveBeenCalledWith('No files selected');
      httpMock.expectNone('/api/upload');
    });

    it('should set isUploading to true during upload', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      component.selectedFiles = [file];

      component.uploadFiles();

      expect(component.isUploading).toBe(true);

      const req = httpMock.expectOne('/api/upload');
      req.flush({ fileId: 'file123' });
    });

    it('should clear selection after successful upload', (done) => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      component.selectedFiles = [file];

      component.uploadComplete.subscribe(() => {
        setTimeout(() => {
          expect(component.selectedFiles.length).toBe(0);
          done();
        }, 0);
      });

      component.uploadFiles();

      const req = httpMock.expectOne('/api/upload');
      req.flush({ fileId: 'file123' });
    });
  });

  describe('File Management', () => {
    it('should remove file at specified index', () => {
      const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
      component.selectedFiles = [file1, file2];

      component.removeFile(0);

      expect(component.selectedFiles.length).toBe(1);
      expect(component.selectedFiles[0]).toBe(file2);
    });

    it('should clear error message when all files are removed', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      component.selectedFiles = [file];
      component.errorMessage = 'Some error';

      component.removeFile(0);

      expect(component.selectedFiles.length).toBe(0);
      expect(component.errorMessage).toBe('');
    });

    it('should clear all selected files', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      component.selectedFiles = [file];
      component.errorMessage = 'Some error';
      component.uploadProgress$.next(50);

      component.clearSelection();

      expect(component.selectedFiles.length).toBe(0);
      expect(component.errorMessage).toBe('');
      expect(component.uploadProgress$.value).toBe(0);
    });
  });

  describe('Helper Methods', () => {
    it('should generate accept attribute from allowed types', () => {
      component.allowedTypes = ['application/pdf', 'image/jpeg'];

      const accept = component.acceptAttribute;

      expect(accept).toBe('application/pdf,image/jpeg');
    });

    it('should return empty string for accept attribute when no allowed types', () => {
      component.allowedTypes = [];

      const accept = component.acceptAttribute;

      expect(accept).toBe('');
    });

    it('should generate unique file ID', () => {
      const id1 = component['generateFileId']();
      const id2 = component['generateFileId']();

      expect(id1).toContain('file_');
      expect(id2).toContain('file_');
      expect(id1).not.toBe(id2);
    });
  });

  describe('Component Destruction', () => {
    it('should complete destroy subject on ngOnDestroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('DOM Rendering', () => {
    it('should display dropzone with label', () => {
      component.label = 'Upload Resume';
      fixture.detectChanges();

      const dropzone = fixture.debugElement.query(By.css('.dropzone'));
      expect(dropzone).toBeTruthy();

      const label = fixture.debugElement.query(By.css('.primary-text'));
      expect(label.nativeElement.textContent).toBe('Upload Resume');
    });

    it('should apply drag-over class when dragging', () => {
      component.isDragOver = true;
      fixture.detectChanges();

      const dropzone = fixture.debugElement.query(By.css('.dropzone'));
      expect(dropzone.nativeElement.classList.contains('drag-over')).toBe(true);
    });

    it('should display selected files list when files are selected', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      component.selectedFiles = [file];
      fixture.detectChanges();

      const filesList = fixture.debugElement.query(By.css('.selected-files'));
      expect(filesList).toBeTruthy();

      const fileName = fixture.debugElement.query(By.css('.file-name'));
      expect(fileName.nativeElement.textContent).toBe('test.txt');
    });

    it('should display progress bar when uploading', () => {
      component.isUploading = true;
      component.uploadProgress$.next(50);
      fixture.detectChanges();

      const progressBar = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressBar).toBeTruthy();

      const progressText = fixture.debugElement.query(By.css('.progress-text'));
      expect(progressText.nativeElement.textContent).toContain('50%');
    });

    it('should display error message when error occurs', () => {
      component.errorMessage = 'File too large';
      fixture.detectChanges();

      const errorDiv = fixture.debugElement.query(By.css('.error-message'));
      expect(errorDiv).toBeTruthy();
      expect(errorDiv.nativeElement.textContent).toContain('File too large');
    });

    it('should display upload actions when files are selected', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      component.selectedFiles = [file];
      component.isUploading = false;
      fixture.detectChanges();

      const uploadActions = fixture.debugElement.query(By.css('.upload-actions'));
      expect(uploadActions).toBeTruthy();
    });

    it('should hide upload actions when uploading', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      component.selectedFiles = [file];
      component.isUploading = true;
      fixture.detectChanges();

      const uploadActions = fixture.debugElement.query(By.css('.upload-actions'));
      expect(uploadActions).toBeFalsy();
    });

    it('should display file size hint when configured', () => {
      component.maxSizeMB = 5;
      fixture.detectChanges();

      const hint = fixture.debugElement.query(By.css('.hint-text'));
      expect(hint.nativeElement.textContent).toContain('Max size: 5 MB');
    });

    it('should display allowed types hint when configured', () => {
      component.allowedTypes = ['application/pdf', 'image/jpeg'];
      fixture.detectChanges();

      const hint = fixture.debugElement.query(By.css('.hint-text'));
      expect(hint.nativeElement.textContent).toContain('application/pdf, image/jpeg');
    });
  });
});
