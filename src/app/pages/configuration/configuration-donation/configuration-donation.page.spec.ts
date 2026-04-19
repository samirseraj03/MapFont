import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigurationDonationPage } from './configuration-donation.page';

describe('ConfigurationDonationPage', () => {
  let component: ConfigurationDonationPage;
  let fixture: ComponentFixture<ConfigurationDonationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ConfigurationDonationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
