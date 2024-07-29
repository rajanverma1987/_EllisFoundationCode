// data.service.ts
import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'https://ellisfoundationapi.infodatixhosting.com//auth/getdata';

  fetchData(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `${token}` };

    return from(axios.get(this.apiUrl, { headers })) as Observable<AxiosResponse<any>>;
  }
}
