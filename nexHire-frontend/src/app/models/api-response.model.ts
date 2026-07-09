/**
 * Generic API response wrapper.
 * Backend may return this wrapper or direct entity objects.
 * Services should handle both cases.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  timestamp?: string;
}

/**
 * Paginated response wrapper
 */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page (0-indexed)
  first: boolean;
  last: boolean;
}

/**
 * Generic filter/query params
 */
export interface FilterParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

/**
 * Bulk operation summary response
 */
export interface BulkOperationResult {
  totalRequested: number;
  successCount: number;
  skippedCount: number;
  failedCount: number;
  skippedRecords?: SkippedRecord[];
  failedRecords?: FailedRecord[];
}

export interface SkippedRecord {
  id: number;
  identifier?: string;
  reason: string;
}

export interface FailedRecord {
  id: number;
  identifier?: string;
  reason: string;
}
