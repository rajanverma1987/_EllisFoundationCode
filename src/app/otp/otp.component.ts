import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class OtpComponent {
  otp: string = '';
  showPasswordInputs: boolean = false;
  email: string = '';
  errorMessage: string = '';
  context: string = '';
  token: string = ''; // Declare the 'token' property

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.otp = params['otp'] || '';
      this.context = params['context'] || '';
    });
    this.token = history.state?.token || '';
    // const context = this.route.snapshot.queryParams['context'];
    // if (context == 'login') {
    //   this.verifyLogin();
    // } else if (context == 'otp') {
    //   this.verifyOTP();
    // }
  }
  verifyOTP() {
    console.log('verifyOTP', this.context)
    if (!this.otp) {
      this.errorMessage = 'OTP is missing.';
      return;
    }
    const queryParams = `email=${encodeURIComponent(this.email)}&otp=${encodeURIComponent(this.otp)}`;
    axios.post<any>(`https://ellisfoundationapi.infodatixhosting.com//auth/confirm_otp?${queryParams}`, {})
      .then(response => {
        console.log('Server response:', response); // Log the response for debugging
        if (response.data && response.data == 'OTP accepted') {
          this.router.navigate(['/password-setup'], { queryParams: { email: this.email } });
        } else {
          this.errorMessage = 'Invalid OTP';
        }
      })
      .catch(error => {
        console.error('HTTP Error:', error); 
        this.errorMessage = 'Error verifying OTP for registration';
      });
  }
  verifyLogin() {
    console.log('verifyLogin', this.context.toString().length, this.context);
    if (!this.otp) {
      this.errorMessage = 'OTP is missing.';
      return;
    }
    const token = localStorage.getItem('access_token');
    const queryParams = `otp=${encodeURIComponent(this.otp)}`;
    axios.post<any>(`https://ellisfoundationapi.infodatixhosting.com//auth/token?${queryParams}`, {}   , 
    {
      headers: {
        Authorization: `${token}`,
      },
    }
    )
      .then(response => {
        console.log('Server response:', response); // Log the response for debugging
        if (response.data && response.data.data.access_token) {
          console.log('OTP Verified! Access Token:', response.data.data.access_token);
          localStorage.setItem('access_token', response.data.data.access_token);
         this.router.navigate(['/home'], { queryParams: { email: this.email } });
          console.log('email', this.email);
        } else {
          this.errorMessage = 'Invalid OTP';
        }
      })
      .catch(error => {
        console.error('HTTP Error:', error); 
        this.errorMessage = 'Error verifying OTP for login';
      });
  }
}
