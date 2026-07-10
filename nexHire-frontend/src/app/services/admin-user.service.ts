import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { BaseService } from './base.service';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  lifecycleStatus?: string;
  active: boolean;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(API_ENDPOINTS.USERS.BASE);
  }

  updateRole(id: number, role: string): Observable<AdminUser> {
    return this.http.put<AdminUser>(API_ENDPOINTS.USERS.UPDATE_ROLE(id), {
      role,
    });
  }

  deactivate(id: number): Observable<AdminUser> {
    return this.http.put<AdminUser>(API_ENDPOINTS.USERS.DEACTIVATE(id), {});
  }

  activate(id: number): Observable<AdminUser> {
    return this.http.put<AdminUser>(`/api/users/${id}/activate`, {});
  }

  createUser(payload: any): Observable<AdminUser> {
    return this.http.post<AdminUser>(API_ENDPOINTS.USERS.BASE, payload);
  }

  getRoles(): Observable<{ name: string; description: string }[]> {
    return this.http.get<{ name: string; description: string }[]>(
      API_ENDPOINTS.ROLES.BASE,
    );
  }
}
