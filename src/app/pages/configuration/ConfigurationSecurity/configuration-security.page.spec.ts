import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigurationSecurityPage } from './configuration-security.page';

describe('ConfigurationSecurityPage', () => {
  let component: ConfigurationSecurityPage;
  let fixture: ComponentFixture<ConfigurationSecurityPage>;

  beforeEach(async() => {
    fixture = TestBed.createComponent(ConfigurationSecurityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
