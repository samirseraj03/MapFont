import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { NavController, AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AuthFacade } from '../../../core/facades/auth.facade';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('LoginPage - Automatización de OTP', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let authFacadeSpy: jasmine.SpyObj<AuthFacade>;
  let alertSpy: jasmine.SpyObj<HTMLIonAlertElement>;

  beforeEach(async () => {
    alertSpy = jasmine.createSpyObj('HTMLIonAlertElement', ['present', 'onDidDismiss']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    alertControllerSpy.create.and.returnValue(Promise.resolve(alertSpy));

    authFacadeSpy = jasmine.createSpyObj('AuthFacade', [
      'login', 'logout', 'initOAuthListener', 'requestPasswordRecovery', 
      'verifyRecoveryCode', 'updateRecoveredPassword'
    ]);

    const activatedRouteStub = {
      queryParams: of({ email: 'test@mail.com' })
    };

    const navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateRoot']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    translateSpy.instant.and.callFake((key: string) => key);

    const authStateSpy = { isLogin: false, intendedRoute: null };

    await TestBed.configureTestingModule({
      imports: [LoginPage, TranslateModule.forRoot()],
      providers: [
        { provide: NavController, useValue: navCtrlSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: AuthFacade, useValue: authFacadeSpy },
        { provide: AuthStateService, useValue: authStateSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: AlertController, useValue: alertControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse la vista limpiamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería levantar un Alert paramétrico tras llamar forgotPassword()', fakeAsync(() => {
    authFacadeSpy.requestPasswordRecovery.and.returnValue(Promise.resolve(true));

    component.forgotPassword();
    tick();

    expect(alertControllerSpy.create).toHaveBeenCalled();
    const args = alertControllerSpy.create.calls.mostRecent().args[0];
    expect(args?.inputs?.[0].name).toBe('email');
  }));

  it('debería levantar un Alert pidiendo código OTP tras presionar PromptForCode', fakeAsync(() => {
    authFacadeSpy.verifyRecoveryCode.and.returnValue(Promise.resolve(true));

    component.promptForCode('test@domain.com');
    tick();

    expect(alertControllerSpy.create).toHaveBeenCalled();
    const args = alertControllerSpy.create.calls.mostRecent().args[0];
    expect(args?.inputs?.[0].name).toBe('token');
  }));

  it('debería levantar un modal para escribir la Nueva Contraseña', fakeAsync(() => {
    authFacadeSpy.updateRecoveredPassword.and.returnValue(Promise.resolve(true));

    component.promptForNewPassword();
    tick();

    expect(alertControllerSpy.create).toHaveBeenCalled();
    const args = alertControllerSpy.create.calls.mostRecent().args[0];
    expect(args?.inputs?.[0].name).toBe('password');
  }));
});
