// no-records.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-no-records',
  templateUrl: './no-records.component.html',
  styleUrls: ['./no-records.component.css']
})
export class NoRecordsComponent implements OnInit {
  noRecordsMessage: string | undefined;
  email: string;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.noRecordsMessage = params['message'];
      this.email = params['email'];
    });
  }
}
