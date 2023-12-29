import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-student-detail-popup',
  template: `
    <div class="popup-container">
      <h2>Student Details</h2>
      <p>
        SSN: {{ maskSSN(studentDetails.data.data.SSN) }}<br />
        Birthdate: {{ formatDate(studentDetails.data.data.BIRTHDATE) }}<br />
        Hometown: {{ studentDetails.data.data.CITY }}<br />
        High School : {{ studentDetails.data.data.COLLEGE }}
      </p>
    </div>
  `,
  styles: [`
    .popup-container {
      padding: 30px;
      border-radius: 5px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
      background-color: #fff;
      max-width: 500px;
      width: 100%;
      margin: auto;
      position: relative;
    }

    h2 {
      color: #333;
      font-size: 1.8em;
      margin-bottom: 15px;
    }

    p {
      font-size: 1.4em;
      line-height: 1.6;
    }

    
  `]
})
export class StudentDetailPopupComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public studentDetails: any) {
  }
  maskSSN(ssn: string): string {
    if (!ssn) {
      return 'N/A'; // or any other placeholder for null SSN
    }
    if (typeof ssn === 'string' && ssn.length >= 4) {
      const last4Digits = ssn.slice(-4);
      return `XXX-XX-${last4Digits}`;
    } else {
      return 'Invalid SSN Format'; // Handle unexpected SSN format
    }
  }
  

  formatDate(dateString: string): string {
    // Assuming the date is in ISO format
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
