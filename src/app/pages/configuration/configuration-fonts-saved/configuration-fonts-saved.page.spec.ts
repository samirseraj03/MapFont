import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigurationFontsSavedPage } from './configuration-fonts-saved.page';

describe('ConfigurationFontsSavedPage', () => {
  let component: ConfigurationFontsSavedPage;
  let fixture: ComponentFixture<ConfigurationFontsSavedPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ConfigurationFontsSavedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
