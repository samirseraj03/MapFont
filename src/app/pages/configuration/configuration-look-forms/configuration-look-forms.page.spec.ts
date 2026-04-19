import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigurationLookFormsPage } from './configuration-look-forms.page';

describe('ConfigurationLookFormsPage', () => {
  let component: ConfigurationLookFormsPage;
  let fixture: ComponentFixture<ConfigurationLookFormsPage>;

  beforeEach(async() => {
    fixture = TestBed.createComponent(ConfigurationLookFormsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
