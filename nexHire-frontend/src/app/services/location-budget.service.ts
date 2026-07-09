import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LocationBudget,
  UpdateLocationRequest,
} from '../models/location-budget.model';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { BaseService } from './base.service';

@Injectable({ providedIn: 'root' })
export class LocationBudgetService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  /** HR: list locations with budget + seat availability. */
  getAll(): Observable<LocationBudget[]> {
    return this.http.get<LocationBudget[]>(API_ENDPOINTS.LOCATIONS.BASE);
  }

  /** HR: update budget/seat configuration for a location. */
  update(
    id: number,
    request: UpdateLocationRequest,
  ): Observable<LocationBudget> {
    return this.http.put<LocationBudget>(
      API_ENDPOINTS.LOCATIONS.BY_ID(id),
      request,
    );
  }
}
