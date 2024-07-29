import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  email: string = '';
  otp: string = '';
  password: string = '';
  confirmPassword: string = '';
  showOtpInputs: boolean = false;
  showPasswordInputs: boolean = false;
  passwordsMatch: boolean = true;
  errorMessage: string = ''; // Add a variable to store the error message

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}
  
  navigateToOTP() {
    if (!this.email) {
      this.errorMessage = 'Email is missing.';
      return;
    }
    this.sendOTP();
    this.router.navigate(['/otp'], { queryParams: { email: this.email, context: 'otp' } });
  }
  
  sendOTP() {
    const url = `https://ellisfoundationapi.infodatixhosting.com//auth/send_otp?email=${encodeURIComponent(this.email)}`;
    const data = {};
      this.http.post<any>(url, data).subscribe(
      response => {
        if (response.message) {
          this.showOtpInputs = true;
        } else {
          console.log('Unexpected response:', response);
        }
      },
      (error: HttpErrorResponse) => {
        console.error('HTTP Error:', error);
        console.log('Complete error response:', error);
        if (error.error && error.error.detail && error.error.detail.length > 0) {
          // Assuming the error message is in the first item of the detail array
          this.errorMessage = error.error.detail[0];
        } else {
          this.errorMessage = 'An unexpected error occurred.';
        }
      }
    );
  }
  
  

  checkPasswordMatch() {
    this.passwordsMatch = this.password === this.confirmPassword;
  }

  register() {
    // Check if passwords match before proceeding
    if (!this.passwordsMatch) {
      console.log('Passwords do not match');
      return;
    }

   
  }
}
