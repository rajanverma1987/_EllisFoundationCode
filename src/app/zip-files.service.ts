// zip-files.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZipFilesService {
  private apiUrl = 'Your_Api_Address'; // Adjust this URL accordingly

  constructor(private http: HttpClient) {}

  getFilesWithToken(token: string): Observable<string | null> {
    const headers = new HttpHeaders({
      'Authorization': `${token}`
    });

    return this.http.get<string | null>(`${this.apiUrl}/auth/getzipfile`, { headers });
  }
}
