// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegistrationComponent } from './registration/registration.component'; // Import RegistrationComponent
import { OtpComponent } from './otp/otp.component';
import { PasswordSetupComponent } from './password-setup/password-setup.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoCacheInterceptor } from './interceptor.service';
import { MatDialogModule } from '@angular/material/dialog'; // Add this import
// import { FilesPopupComponent } from './files-popup/files-popup.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; // Adjust the path if needed
import { AuthenticationService } from './authentication.service';
import { NoRecordsComponent } from './no-records/no-records.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    RegistrationComponent,
    OtpComponent,
    PasswordSetupComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,
    NgbModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NoCacheInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
