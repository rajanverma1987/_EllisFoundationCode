import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PasswordConfirmationDialogComponent } from './password-confirmation-dialog/password-confirmation-dialog.component';
import { HttpClient } from '@angular/common/http';
import axios from 'axios';

@Component({
  selector: 'app-password-setup',
  templateUrl: './password-setup.component.html',
  styleUrls: ['./password-setup.component.css']
})
export class PasswordSetupComponent {
  password: string = '';
  confirmPassword: string = '';
  showOtpInputs: boolean = false;
  passwordsMatch: boolean = true;
  submitted: boolean = false; // Track whether the form has been submitted
  email: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private dialog: MatDialog, private http: HttpClient, private route: ActivatedRoute) 
  {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

//   checkPasswordMatch() {
//  this.passwordsMatch = this.password === this.confirmPassword;
//  }

  setPassword() {
    if (!this.password || !this.confirmPassword || this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    const queryParams = `email=${encodeURIComponent(this.email)}&pwd=${encodeURIComponent(this.password)}`;
    console.log('Sending data to server:', queryParams);
    axios.post<any>(`https://ellisfoundationapi.infodatixhosting.com//auth/update_pass?${queryParams}`, {})
      .then(response => {
        console.log('Server response:', response.status); // Log the response for debugging
        if (response.status == 205) {
          const dialogRef = this.dialog.open(PasswordConfirmationDialogComponent);
          dialogRef.afterClosed().subscribe(result => {
             if (result) {
              this.router.navigate(['/login']);
             }
          });
        } else {
          this.errorMessage = 'Failed to update password.';
        }
      })
      .catch(error => {
      console.error('HTTP Error:', error);
      this.errorMessage = 'Error updating password.';
    });
  }
}
