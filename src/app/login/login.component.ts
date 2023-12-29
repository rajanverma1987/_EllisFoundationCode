// src/app/login/login.component.ts
import { Component } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}


// async login() {
//   try {
//     if (!this.password) {
//       this.errorMessage = 'Passwords is missing.';
//       return;
//     }

//     const formData = new FormData();
//     formData.append('username', this.email);
//     formData.append('password', this.password);
//     console.log('Login Form Data:', formData);
//     const response = await axios.post('Your_Api_Address/auth/login', formData);
//     console.log('Server Response:', response);
//     if (response.data && response.data.data.access_token) {


//       console.log('Login Successful! Access Token:', response.data.data.access_token);
//       localStorage.setItem('access_token', response.data.data.access_token);


//       // this.router.navigate(['/otp'], { queryParams: { email: this.email, context: 'login' } });
//       this.router.navigate(['/home'], { queryParams: { email: this.email } });
//     } else {
//       this.errorMessage = 'Incorrect server response format';
//     }

//   } catch (error) {
//     if (error.response && error.response.status === 401) {
//       this.errorMessage = 'Incorrect username or password';
//     } else {
//       this.errorMessage = 'An unexpected error occurred during login';
//     }
//   }
// }



async login() {
  try {
    if (!this.password) {
      this.errorMessage = 'Passwords are missing.';
      return;
    }

    const formData = new FormData();
    formData.append('username', this.email);
    formData.append('password', this.password);
    console.log('Login Form Data:', formData);

    const token = localStorage.getItem('access_token'); // Assuming you have a valid way to retrieve the token

    const response = await axios.post('Your_Api_Address/auth/login', formData, {
      headers: {
        Authorization: `${token}`,
      },
    });

    console.log('Server Response:', response);

    if (response.data && response.data.data.access_token) {
      console.log('Login Successful! Access Token:', response.data.data.access_token);
      localStorage.setItem('access_token', response.data.data.access_token);
      this.router.navigate(['/home'], { queryParams: { email: this.email } });
    } else {
      this.errorMessage = 'Incorrect server response format';
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      this.errorMessage = 'Incorrect username or password';
    } else {
      this.errorMessage = 'An unexpected error occurred during login';
    }
  }
}



}
