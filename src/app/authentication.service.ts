// authentication.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  authenticateUser(credentials: any) {
    // Assuming you have an authentication endpoint
    return this.http.post('/api/authenticate', credentials);
  }

  isAuthenticated(): boolean {
    // Check if the user is authenticated based on your criteria
    return localStorage.getItem('access_token') !== null;
  }
}
