import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  private apiUrl = 'https://ellisfoundationapi.infodatixhosting.com//auth/getfile';

  constructor(private http: HttpClient) {}

  getFiles(accessStudentId: number): Observable<string> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `${token}`);
  
    // Use HttpParams to set the access_student_id as a query parameter
    const params = new HttpParams().set('access_student_id', accessStudentId);
  
    const url = `${this.apiUrl}`;
 
  
    return this.http.get<{ data: any }>(url, { headers, params })
      .pipe(
        map(response => response.data.data), // Extract the file path from the response
        tap(
          
          data => console.log('Request successful. File Path:', data),
          error => console.error('Error in request:', error)
        )
      );
  }
  
}
