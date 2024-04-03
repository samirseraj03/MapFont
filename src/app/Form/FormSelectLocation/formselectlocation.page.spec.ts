import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormSelectLocationPage } from './formselectlocation.page';

describe('FormSelectLocationPage', () => {
  let component: FormSelectLocationPage;
  let fixture: ComponentFixture<FormSelectLocationPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(FormSelectLocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
