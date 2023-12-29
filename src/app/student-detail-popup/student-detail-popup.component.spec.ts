import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDetailPopupComponent } from './student-detail-popup.component';

describe('StudentDetailPopupComponent', () => {
  let component: StudentDetailPopupComponent;
  let fixture: ComponentFixture<StudentDetailPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDetailPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentDetailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
