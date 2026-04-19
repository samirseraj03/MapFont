import { ComponentFixture, TestBed } from '@angular/core/testing';

import { fontsPage } from './Fonts.page';

describe('fontsPage', () => {
  let component: fontsPage;
  let fixture: ComponentFixture<fontsPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(fontsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
