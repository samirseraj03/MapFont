import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageSuccessPage } from './page-success.page';

describe('PageSuccessPage', () => {
  let component: PageSuccessPage;
  let fixture: ComponentFixture<PageSuccessPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PageSuccessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
