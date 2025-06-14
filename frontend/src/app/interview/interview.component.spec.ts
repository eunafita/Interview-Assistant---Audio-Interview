import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewComponent } from './interview.component';

describe('InterviewComponent', () => {
  let component: InterviewComponent;
  let fixture: ComponentFixture<InterviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
