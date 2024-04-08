import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormInsertInfromationPage } from './form-insert-infromation.page';

describe('FormInsertInfromationPage', () => {
  let component: FormInsertInfromationPage;
  let fixture: ComponentFixture<FormInsertInfromationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FormInsertInfromationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
