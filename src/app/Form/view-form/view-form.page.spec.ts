import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewFormPage } from './view-form.page';

describe('ViewFormPage', () => {
  let component: ViewFormPage;
  let fixture: ComponentFixture<ViewFormPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ViewFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
