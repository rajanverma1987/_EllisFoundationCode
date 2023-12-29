// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegistrationComponent } from './registration/registration.component'; // Import RegistrationComponent
import { OtpComponent } from './otp/otp.component'; // Import OtpComponent
import { PasswordSetupComponent } from './password-setup/password-setup.component';
import { PasswordConfirmationDialogComponent } from './password-setup/password-confirmation-dialog/password-confirmation-dialog.component';
import { AuthGuard } from './auth.guard';
import { NoRecordsComponent } from './no-records/no-records.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // { path: 'https://ellisfoundation.infodatixhosting.com/login', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  // { path: 'home', component: HomeComponent },


  { path: 'register', component: RegistrationComponent }, // Add route for RegistrationComponent
  { path: 'otp', component: OtpComponent }, // Add route for OtpComponent
  { path: 'password-setup', component: PasswordSetupComponent },
  { path: 'password-confirmation', component: PasswordConfirmationDialogComponent, outlet: 'dialog' },
  { path: 'no-records', component: NoRecordsComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
