// home.component.ts
import {
  Component,
  OnInit,
  NgZone,
  ViewChild,
  ElementRef,
  Input,
} from '@angular/core';
import { DataService } from '../data.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import axios from 'axios';
import { HttpClient } from '@angular/common/http';
import { CloseScrollStrategy } from '@angular/cdk/overlay';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
// import {FilesPopupComponent } from '../files-popup/files-popup.component'
import { FilesService } from '../files-service.service';
import {
  NgbDateStruct,
  NgbCalendar,
  NgbInputDatepicker,
} from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { default as moment } from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { ZipFilesService } from '../zip-files.service';
import { StudentDetailPopupComponent } from '../student-detail-popup/student-detail-popup.component';
import { formatDate } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  enrollmentDeadline: string;
  paymentDue: string;
  email: string = ''; // Variable to store the logged-in user's email
  tableData: any[] = [];
  year: number;
  followup: number;
  prepared: string;
  editingRow: any = null;
  editingRowId: number | null = null;
  College_ID: number;
  AP_ID: number;
  gradeYear: string;
  changedRows: { index: number; data: any }[] = [];
  editedRowIds: number[] = [];
  editingRowIndex: number | null = null;
  Semester_Credit_Hours: number;
  Cummulative_Credit_Hours: number;
  warnAgain: boolean;
  drop: boolean;
  dateForm: FormGroup; // Declare dateForm property
  handleInput(event: any) {
    const inputValue: string = event.target.value;
  }
  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private filesService: FilesService,
    public dialog: MatDialog,
    private calendar: NgbCalendar,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private zipFilesService: ZipFilesService,
    private zone: NgZone
  ) {
    const currentDate = new Date();
    this.prepared = currentDate.toISOString().slice(0, 10);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || '';
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkAuthentication();
      }
    });
    this.loadDataFromApi();
  }
  checkAuthentication() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  exitEditing(): void {
    // this.isEditing = false;
    this.editingRowIndex = null;
    this.editingRow = null;
  }

  startEditing(index: number): void {
    this.editingRowIndex = index;
    this.editingRow = { ...this.tableData[index] };
    this.editedRowIds.push(index); // Add the index to the editedRowIds array
  }

  isRowEditing(index: number): boolean {
    return this.editingRowIndex === index;
  }

  showSuccessButton = false;

  saveAllChanges(): void {
    const index = this.editingRowIndex;
    if (index !== null && index >= 0 && index < this.tableData.length) {
      // Update the currently editing row
      this.tableData[index] = { ...this.editingRow };
    }

    const editedRows = this.tableData.filter((row, i) =>
      this.editedRowIds.includes(i)
    );
    const updatedRecords = editedRows.map((row) => {
      return {
        record_id: row.Record_ID !== undefined ? row.Record_ID : 0,
        AP_ID: this.AP_ID,
        Access_Student_ID: row.accessStuID || 0,
        Semester_Credit_Hours: parseFloat(row.creditHours.spring2023) || 0,
        Cummulative_Credit_Hours: parseFloat(row.creditHours.cumulative) || 0,
        Semester_GPA: parseFloat(row.gpa.spring2023) || 0,
        Cummulative_GPA: parseFloat(row.gpa.cumulative) || 0,
        Warn_Again: Boolean(row.warnAgain),
        Drop_Student: Boolean(row.drop),
        Code: row.enrollment.code || 0,
        Hours: row.enrollment.hours || 0,
        [`Stu ID`]: row.schoolID || '',
        Married: row.studentName.marriedName || '',
        ['College Match Denied']: Boolean(row.collegeMatchDenied),
        Comments: row.commentsStatus || '',
      };
    });

    const updatedHeaders = {
      AP_ID: this.AP_ID,
      EnrollmentDeadline: this.enrollmentDeadline,
      PaymentDue: this.paymentDue,
    };

    console.log('updatedHeaders', updatedHeaders);
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Error: Authentication token not found');
      return;
    }

    axios
      .post(
        'https://ellisfoundationapi.infodatixhosting.com//auth/updatedata',
        { updatedRecords, updatedHeaders },
        // updatedRecords,
        { headers: { Authorization: `${token}` } }
      )
      .then(async (response) => {
        if (response.data.message == 'Success') {
          // Reload table data and show the sliding button
          await this.loadDataFromApi();
          this.zone.run(() => {
            this.showSuccessButton = true;

            // Hide the button after 1 second
            setTimeout(() => {
              this.showSuccessButton = false;
            }, 2000);
          });

          this.editingRowIndex = null;
          this.editedRowIds = [];
        } else {
          console.log('Save unsuccessful:', response.data.message);
        }
      })
      .catch((error) => console.log('API Error:', error));
  }

  decimalfiltertwo(event: any) {
    const reg = /^-?\d*(\.\d{0,2})?$/;
    let input = event.target.value + String.fromCharCode(event.charCode);

    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  decimalfilterthree(event: any) {
    const reg = /^-?\d*(\.\d{0,3})?$/;
    let input = event.target.value + String.fromCharCode(event.charCode);

    if (!reg.test(input)) {
      event.preventDefault();
    }
  }
  @ViewChild('tableToExport', { static: false }) tableToExport!: ElementRef;
  exportToExcel(): void {
    // Create a deep copy of the table element
    const tableClone = this.tableToExport.nativeElement.cloneNode(
      true
    ) as HTMLElement;

    // Iterate over the rows and extract input value
    const rows = tableClone.querySelectorAll('tr');
    rows.forEach((row) => {
      let cells = row.querySelectorAll('td');
      if (cells.length === 0) cells = row.querySelectorAll('th');
      cells.forEach((cell) => {
        const input = cell.querySelector('input');
        if (input) {
          console.log(input.value);
          cell.textContent = input.value;
        }
        const textarea = cell.querySelector('textarea');
        if (textarea) {
          cell.textContent = textarea.value;
        }
      });
    });

    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableClone);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'ExportedData.xlsx');
  }

  loadDataFromApi(): void {
    this.dataService.fetchData().subscribe(
      (data: any) => {
        if (
          data &&
          (data.status === 201 ||
            data.data.data.message === 'No Record found for 2024 Spring.')
        ) {
          const noRecordsMessage = data.data.data.message;
          console.log('message', noRecordsMessage);

          this.router.navigate(['/no-records'], {
            queryParams: { email: this.email, message: noRecordsMessage },
          });

          return;
        }
        const formatDate = (ISODate) => {
          if (ISODate) {
            return ISODate.split('T')[0];
          } else {
            return ISODate;
          }
        };

        if (
          data &&
          data.data.data.headers &&
          Array.isArray(data.data.data.records)
        ) {
          const ap_headers = data.data.data.headers;
          const ap_records = data.data.data.records;

          this.tableData = ap_records.map((row: any) => {
            return {
              newIncomingStudent: row['Req Release New Students'],
              schoolID: row[`Stu ID`],
              studentName: {
                last: row.Last,
                marriedName: row.Married,
                first: row.First,
                middle: row.Middle,
              },
              creditHours: {
                spring2023: row.Semester_Credit_Hours,
                cumulative: row.Cummulative_Credit_Hours,
              },
              gpa: {
                spring2023: row.Semester_GPA,
                cumulative: row.Cummulative_GPA,
              },
              collegeMatchDenied: row['College Match Denied'],
              commentsStatus: row.Comments,
              enrollment: {
                code: row.Code,
                hours: row.Hours,
              },
              previousHrs: row['Prev HRS'],
              previousGPA: row['Prev GPA'],

              hours:
                row.Semester_Credit_Hours < row.Min_Hours_Semester_Credit_Hours
                  ? 'X'
                  : null,

              grades:
                row.Semester_GPA < row.Min_Grades_Semester_GPA ? 'X' : null,

              warnAgain: row.Warn_Again,
              drop: row.Drop_Student,

              deniedPreviously: row['College Match Denied'],
              currentSemester: row['OK to Pay'],
              renewFor5thYear: row['E+ or 8+ (Renew past 8)'],
              completedSemesters: row['Cum Semesters'],
              amountIfNot2k: row['Amount if not $2k'],
              fallOnly: row['Fall only ?'],
              accessStuID: row['Access Stu ID'],
              Record_ID: row.Record_ID || 0,
            };
          });

          this.enrollmentDeadline = formatDate(ap_headers.EnrollmentDeadline);
          this.paymentDue = formatDate(ap_headers.PaymentDue);
          this.year = ap_headers.SemesterYear;
          this.College_ID = ap_headers.College_ID;
          this.AP_ID = ap_headers.AP_ID;
          this.gradeYear = ap_headers.gradeYear;
          this.followup = ap_headers.FollowUp || 0;
        } else {
          console.error(
            'Error: Invalid tableData structure in the API response'
          );
        }
      },
      (error) => {
        console.error('Error fetching data from FastAPI:', error);
      }
    );
  }

  logout(): void {
    const token = localStorage.getItem('access_token');

    localStorage.removeItem('access_token');
    localStorage.removeItem('loggedInUserEmail');
    this.router.navigate(['/login']);
  }

  // Inject the FilesService in the constructor

  openFilesPopup(accessStudentId: number): void {
    this.filesService.getFiles(accessStudentId).subscribe((filePath) => {
      // Check if filePath is undefined or null
      if (filePath === undefined || filePath === null) {
        // Show a popup or alert indicating that there is no release form
        alert('No Release Form Available!');
        return;
      }

      // Construct the complete URL
      const fileUrl = `https://ellisfoundationapi.infodatixhosting.com//${filePath}`;
      console.log('path:', filePath);

      // Open the file in a new window
      const newWindow = window.open(fileUrl, '_blank');

      // Optionally, focus on the new window
      if (newWindow) {
        newWindow.focus();
      }
    });
  }

  openPopup(studentId: string): void {
    const apiUrl = `https://ellisfoundationapi.infodatixhosting.com//auth/getStudentDetail?studentId=${studentId}`;
    const token = localStorage.getItem('access_token');

    if (!token) {
      // Handle the case where the token is not available
      console.error('Access token not found.');
      return;
    }

    const headers = {
      Authorization: `${token}`,
    };

    this.http.get(apiUrl, { headers }).subscribe((data: any) => {
      const dialogRef = this.dialog.open(StudentDetailPopupComponent, {
        data: data,
      });

      dialogRef.afterClosed().subscribe((result) => {
        // Handle the result if needed
      });
    });
  }

  downloadFilesZip(): void {
    const token = localStorage.getItem('access_token');

    if (!token) {
      // Handle the case where the token is not available (e.g., redirect to login)
      alert('Authentication token not available!');
      return;
    }
    console.log('token value:', token);

    this.zipFilesService.getFilesWithToken(token).subscribe((filePath: any) => {
      // Check if filePath is undefined or null
      if (!filePath?.data?.data) {
        // Show a popup or alert indicating that there is no release form
        alert('No Release Form Available!');
        return;
      }

      // Construct the complete URL
      const fileUrl = `https://ellisfoundationapi.infodatixhosting.com//${filePath.data.data}`;
      console.log('path:', filePath.data.data);

      // Open the file in a new window
      const newWindow = window.open(fileUrl, '_blank');

      // Optionally, focus on the new window
      if (newWindow) {
        newWindow.focus();
      }
    });
  }
}
