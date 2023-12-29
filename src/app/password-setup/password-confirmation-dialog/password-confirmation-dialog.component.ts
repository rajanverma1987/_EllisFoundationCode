import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-password-confirmation-dialog',
  templateUrl: './password-confirmation-dialog.component.html',
  styleUrls: ['./password-confirmation-dialog.component.css']
})
export class PasswordConfirmationDialogComponent {
  constructor(public dialogRef: MatDialogRef<PasswordConfirmationDialogComponent>) {}

  closeDialog() {
    this.dialogRef.close(true); // Pass true to indicate OK
  }
}
