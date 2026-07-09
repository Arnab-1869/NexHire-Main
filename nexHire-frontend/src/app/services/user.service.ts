import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { LoggedInUser } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Mock users
  private users: LoggedInUser[] = [
    {
      userId: 1, employeeId: 101, fullName: 'System Admin',
      email: 'admin@nexhire.com', role: 'ADMIN', permissions: [], active: true
    },
    {
      userId: 2, employeeId: 102, fullName: 'Sarah HR',
      email: 'hr@nexhire.com', role: 'HR', permissions: [], active: true
    },
    {
      userId: 4, fullName: 'John Candidate',
      email: 'candidate@nexhire.com', role: 'CANDIDATE', permissions: [], active: true
    },
    {
      userId: 5, fullName: 'Restricted User',
      email: 'restricted@nexhire.com', role: 'CANDIDATE', permissions: [], active: false
    }
  ];

  constructor() {}

  getAllUsers(): Observable<LoggedInUser[]> {
    return of([...this.users]).pipe(delay(400));
  }

  toggleUserStatus(userId: number, active: boolean): Observable<boolean> {
    const user = this.users.find(u => u.userId === userId);
    if (user) {
      user.active = active;
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  changeUserRole(userId: number, newRole: string): Observable<boolean> {
    const user = this.users.find(u => u.userId === userId);
    if (user) {
      user.role = newRole;
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  createUser(userData: Partial<LoggedInUser> & { password?: string }): Observable<LoggedInUser> {
    const newUser: LoggedInUser = {
      userId: Math.floor(Math.random() * 10000) + 10,
      fullName: userData.fullName || '',
      email: userData.email || '',
      role: userData.role || 'CANDIDATE',
      permissions: [],
      active: true
    };
    this.users.unshift(newUser);
    return of(newUser).pipe(delay(400));
  }
}
