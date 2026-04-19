import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationFormPage } from './confirmation-form.page';

describe('ConfirmationFormPage', () => {
  let component: ConfirmationFormPage;
  let fixture: ComponentFixture<ConfirmationFormPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ConfirmationFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
