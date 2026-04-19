import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigurationTabPage } from './configuration-tab.page';

describe('ConfigurationTabPage', () => {
  let component: ConfigurationTabPage;
  let fixture: ComponentFixture<ConfigurationTabPage>;

  beforeEach(async() => {
    fixture = TestBed.createComponent(ConfigurationTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
