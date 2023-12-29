import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordSetupComponent } from './password-setup.component';

describe('PasswordSetupComponent', () => {
  let component: PasswordSetupComponent;
  let fixture: ComponentFixture<PasswordSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordSetupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PasswordSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
