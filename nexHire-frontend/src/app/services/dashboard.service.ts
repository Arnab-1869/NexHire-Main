import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, ChartData } from '../models/admin.model';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { BaseService } from './base.service';

/**
 * Dashboard metrics are computed live by the backend (/api/dashboard).
 * No mock data — every number is derived from persisted domain data.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS);
  }

  getApplicationChart(): Observable<ChartData> {
    return this.http.get<ChartData>(API_ENDPOINTS.DASHBOARD.APPLICATION_CHART);
  }

  getAssessmentChart(): Observable<ChartData> {
    return this.http.get<ChartData>(API_ENDPOINTS.DASHBOARD.ASSESSMENT_CHART);
  }

  getBgvChart(): Observable<ChartData> {
    return this.http.get<ChartData>(API_ENDPOINTS.DASHBOARD.BGV_CHART);
  }

  getTrainingChart(): Observable<ChartData> {
    return this.http.get<ChartData>(API_ENDPOINTS.DASHBOARD.TRAINING_CHART);
  }
}
