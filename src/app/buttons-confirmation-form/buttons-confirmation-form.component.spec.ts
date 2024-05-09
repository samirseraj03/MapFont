import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ButtonsConfirmationFormComponent } from './buttons-confirmation-form.component';

describe('ButtonsConfirmationFormComponent', () => {
  let component: ButtonsConfirmationFormComponent;
  let fixture: ComponentFixture<ButtonsConfirmationFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ButtonsConfirmationFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonsConfirmationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
