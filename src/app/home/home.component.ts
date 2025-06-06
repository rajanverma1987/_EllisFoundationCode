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
  user: any;
  selectedRowData: any = null;
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
        Access_Student_ID: row.accessStuID || '',
        Semester_Credit_Hours:
          (row.creditHours.spring2023 &&
            parseFloat(row.creditHours.spring2023)) ||
          '',
        Cummulative_Credit_Hours:
          (row.creditHours.cumulative &&
            parseFloat(row.creditHours.cumulative)) ||
          '',
        Semester_GPA:
          (row.gpa.spring2023 && parseFloat(row.gpa.spring2023)) || '',
        Cummulative_GPA:
          (row.gpa.cumulative && parseFloat(row.gpa.cumulative)) || '',
        Warn_Again: Boolean(row.warnAgain),
        Drop_Student: Boolean(row.drop),
        Code: row.enrollment.code || '',
        Hours: row.enrollment.hours || '',
        [`Stu ID`]: row.schoolID || '',
        Married: row.studentName.marriedName || '',
        ['College Match Denied']: Boolean(row.collegeMatchDenied),
        Comments: row.commentsStatus || '',
        part: row.part || 'N',
      };
    });

    const updatedHeaders = {
      AP_ID: this.AP_ID,
      EnrollmentDeadline: this.enrollmentDeadline,
      PaymentDue: this.paymentDue,
      collegeId: this.College_ID,
    };

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
    const tableElement: HTMLElement = this.tableToExport.nativeElement;
    const rows = Array.from(tableElement.querySelectorAll('tr'));

    // Headers to exclude (case-insensitive)
    const headersToRemove = [
      'more student detail',
      'click here to download all releases',
      'terms of award',
    ];

    // Find the last header row (usually contains the actual column names)
    let headerRow: HTMLTableRowElement | undefined;
    for (let i = rows.length - 1; i >= 0; i--) {
      const row = rows[i];
      if (row.querySelectorAll('th').length > 0) {
        headerRow = row;
        break;
      }
    }
    if (!headerRow) return;

    // Get indexes of headers to remove
    const indexesToRemove: number[] = [];
    const headerCells = Array.from(headerRow.children);

    headerCells.forEach((cell, index) => {
      // Extract all text content, including nested elements, normalize spaces and lowercase
      const cellText =
        cell.textContent?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
      // Check if this header matches any to remove
      if (headersToRemove.some((h) => cellText.includes(h))) {
        indexesToRemove.push(index);
      }
    });

    // Create new table excluding unwanted columns
    const newTable = document.createElement('table');

    rows.forEach((row) => {
      const newRow = document.createElement('tr');
      const cells = Array.from(row.children);

      cells.forEach((cell, idx) => {
        if (!indexesToRemove.includes(idx)) {
          const newCell = cell.cloneNode(true) as HTMLElement;

          // Replace input/textarea values with their current value
          const input = newCell.querySelector('input');
          if (input) newCell.textContent = (input as HTMLInputElement).value;

          const textarea = newCell.querySelector('textarea');
          if (textarea)
            newCell.textContent = (textarea as HTMLTextAreaElement).value;

          newRow.appendChild(newCell);
        }
      });

      newTable.appendChild(newRow);
    });

    // Export to Excel using XLSX
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(newTable);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'FilteredExport.xlsx');
  }

  // exportToExcel(): void {
  //   // Create a deep copy of the table element
  //   console.log('table to export', this.tableToExport);
  //   const tableClone = this.tableToExport.nativeElement.cloneNode(
  //     true
  //   ) as HTMLElement;

  //   // Iterate over the rows and extract input value
  //   const rows = tableClone.querySelectorAll('tr');
  //   rows.forEach((row) => {
  //     let cells = row.querySelectorAll('td');
  //     if (cells.length === 0) cells = row.querySelectorAll('th');
  //     cells.forEach((cell) => {
  //       const input = cell.querySelector('input');
  //       if (input) {
  //         cell.textContent = input.value;
  //       }
  //       const textarea = cell.querySelector('textarea');
  //       if (textarea) {
  //         cell.textContent = textarea.value;
  //       }
  //     });
  //   });
  //   console.log('table Clone', tableClone);

  //   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableClone);
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  //   XLSX.writeFile(wb, 'ExportedData.xlsx');
  // }

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
          const user = data.data.data.user;
          this.user = user;

          this.tableData = ap_records.map((row: any) => {
            // console.log('row', row);
            return {
              newIncomingStudent: row['Req Release New Students'],
              schoolID: row[`Stu ID`],
              part: row[`Part?`],
              studentName: {
                last: row.Last,
                marriedName: row.Married,
                first: row.First,
                middle: row.Middle,
              },
              creditHours: {
                spring2023: row.Semester_Credit_Hours || '',
                cumulative: row.Cummulative_Credit_Hours || '',
              },
              gpa: {
                spring2023: row.Semester_GPA || '',
                cumulative: row.Cummulative_GPA || '',
              },
              collegeMatchDenied: row['College Match Denied'],
              commentsStatus: row.Comments,
              enrollment: {
                code: row.Code || '',
                hours: row.Hours || '',
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
              scholarshipAmount: row['Pledge Amount'],
            };
          });

          if (ap_headers.EnrollmentDeadline) {
            this.enrollmentDeadline = formatDate(ap_headers.EnrollmentDeadline);
          }

          if (ap_headers.paymentDue)
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
      if (filePath === undefined || filePath === null || filePath == '') {
        // Show a popup or alert indicating that there is no release form
        alert('No Release Form Available!');
        return;
      }

      // Construct the complete URL
      const fileUrl = `https://ellisfoundationapi.infodatixhosting.com//${filePath}`;

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

    this.zipFilesService.getFilesWithToken(token).subscribe((filePath: any) => {
      // Check if filePath is undefined or null
      if (!filePath?.data?.data) {
        // Show a popup or alert indicating that there is no release form
        alert('No Release Form Available!');
        return;
      }

      // Construct the complete URL
      const fileUrl = `https://ellisfoundationapi.infodatixhosting.com//${filePath.data.data}`;

      // Open the file in a new window
      const newWindow = window.open(fileUrl, '_blank');

      // Optionally, focus on the new window
      if (newWindow) {
        newWindow.focus();
      }
    });
  }
  // downloadFilesZip(): void {
  //   const token = localStorage.getItem('access_token');

  //   if (!token) {
  //     // Handle the case where the token is not available (e.g., redirect to login)
  //     alert('Authentication token not available!');
  //     return;
  //   }
  //   console.log('token value:', token);

  //   this.zipFilesService.getFilesWithToken(token).subscribe((filePath: any) => {
  //     // Check if filePath is undefined or null
  //     if (!filePath?.data?.data) {
  //       // Show a popup or alert indicating that there is no release form
  //       alert('No Release Form Available!');
  //       return;
  //     }

  //     // Construct the complete URL
  //     const fileUrl = `https://ellisfoundationapi.infodatixhosting.com//${filePath.data.data}`;

  //     // Open the file in a new window
  //     const newWindow = window.open(fileUrl, '_blank');

  //     // Optionally, focus on the new window
  //     if (newWindow) {
  //       newWindow.focus();
  //     }
  //   });
  // }

  showModal = false;

  openTermsModal(rowData: any): void {
    this.showModal = true;
    this.selectedRowData = rowData;
  }

  closeTermsModal() {
    this.showModal = false;
  }

  formatAmount(value: number | string): string {
    const number = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(number) || number === null) return '0';
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
}
