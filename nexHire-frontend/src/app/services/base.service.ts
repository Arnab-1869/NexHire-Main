import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';

/**
 * BaseService: Shared HTTP utility for all services.
 * Handles both ApiResponse<T> wrapped and direct entity responses.
 */
export abstract class BaseService {
  constructor(protected http: HttpClient) {}

  /**
   * Unwrap ApiResponse<T> or return direct T
   */
  protected unwrap<T>(response: ApiResponse<T> | T): T {
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      return (response as ApiResponse<T>).data;
    }
    return response as T;
  }

  protected buildParams(filters: Record<string, any>): HttpParams {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, String(filters[key]));
      }
    });
    return params;
  }
}
