import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { NavController, ToastController } from '@ionic/angular/standalone';
import { LoadingService } from '../services/loading.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../services/authentication.service';
import { AuthStateService } from '../services/auth-state.service';
import { Services } from '../services/services.service';
import { UserRepository } from '../repositories/user.repository';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  private expirationTime: number | undefined;
  private timerId: any;
  private isOathListenerActive = false;

  /**
   * Flag para evitar que initOAuthListener interfiera cuando register() está en curso.
   * Previene race conditions donde ambos intentan crear el perfil simultáneamente.
   */
  private isRegistering = false;

  /**
   * Flag para evitar que initOAuthListener interfiera cuando login() manual está en curso.
   * login() ya gestiona todo el flujo; el listener no debe duplicar trabajo ni bloquear.
   */
  private isManualLogin = false;

  constructor(
    private authService: AuthenticationService,
    private loadingService: LoadingService,
    private toastController: ToastController,
    private navCtrl: NavController,
    private authState: AuthStateService,
    private services: Services,
    private translate: TranslateService,
    private userRepository: UserRepository
  ) {}

  /**
   * Método centralizado que garantiza que un usuario autenticado tenga su registro
   * en las tablas 'users' y 'usertype'. Funciona para CUALQUIER provider (email, google, etc).
   *
   * - Si el usuario NO existe en 'users' → lo crea con los datos disponibles
   * - Si el usuario YA existe → carga su idioma preferido
   * - Siempre asegura que exista un registro en 'usertype'
   *
   * Usa upsert para protegerse contra duplicados en caso de eventos concurrentes.
   */
  private async ensureUserProfile(user: any): Promise<void> {
    console.log('[AuthFacade] ensureUserProfile iniciado para user.id:', user.id);
    try {
      console.log('[AuthFacade] Buscando usuario en el repositorio...');
      const existingUsers = await this.userRepository.getUser(user.id);
      console.log('[AuthFacade] Resultado getUser:', existingUsers);

      if (!existingUsers || existingUsers.length === 0) {
        console.log('[AuthFacade] Usuario no existe en repositorio local/remoto. Creándolo...');
        console.log('[AuthFacade] Creando usertype...');
        await this.userRepository.upsertUserType({
          admin_role: false,
          user_role: true,
          autencationUserID: user.id
        });
        console.log('[AuthFacade] usertype creado. Creando usuario...');

        await this.userRepository.upsertUser({
          email: user.email || '',
          location: { latitude: 0, longitude: 0 },
          username: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          lastname: '',
          number: 0,
          address: '',
          password: '',
          autencationUserID: user.id,
          language: this.translate.currentLang || this.translate.getDefaultLang() || 'es'
        });
        console.log('[AuthFacade] Usuario creado en el repositorio con éxito.');
      } else {
        console.log('[AuthFacade] Usuario existente encontrado. Sincronizando idioma...');
        const userProfile = existingUsers[0];
        if (userProfile.language) {
          console.log('[AuthFacade] Idioma del perfil:', userProfile.language);
          this.translate.use(userProfile.language);
        } else {
          const currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'es';
          console.log('[AuthFacade] Sin idioma en perfil. Estableciendo:', currentLang);
          await this.userRepository.updateUser(user.id, { language: currentLang } as any);
        }

        // Asegurar que también exista en usertype (puede faltar si se creó parcialmente)
        console.log('[AuthFacade] Comprobando usertype...');
        const userTypeRecords = await this.userRepository.getUserType(user.id);
        console.log('[AuthFacade] Resultado getUserType:', userTypeRecords);
        if (!userTypeRecords || userTypeRecords.length === 0) {
          console.log('[AuthFacade] usertype no existe. Creando...');
          await this.userRepository.upsertUserType({
            admin_role: false,
            user_role: true,
            autencationUserID: user.id
          });
          console.log('[AuthFacade] usertype creado.');
        }
      }
    } catch (err) {
      console.error('[AuthFacade] Error en ensureUserProfile:', err);
      throw err;
    }
  }

  initOAuthListener() {
    console.log('[AuthFacade] initOAuthListener llamado. isOathListenerActive:', this.isOathListenerActive);
    if (this.isOathListenerActive) return;
    this.isOathListenerActive = true;

    this.authService.onAuthStateChange(async (event: string, session: any) => {
      console.log('[AuthFacade] onAuthStateChange disparado:', { event, sessionExists: !!session, isRegistering: this.isRegistering });
      // Solo nos interesan eventos con sesión activa
      if (!session) {
        console.log('[AuthFacade] onAuthStateChange: No hay sesión activa. Ignorando.');
        return;
      }
      if (event !== 'SIGNED_IN' && event !== 'INITIAL_SESSION') {
        console.log('[AuthFacade] onAuthStateChange: Evento no manejado:', event);
        return;
      }

      // Si register() o login() manual están en curso, NO interferir — ya gestionan todo
      if (this.isRegistering || this.isManualLogin) {
        console.log('[AuthFacade] onAuthStateChange: Login/Registro manual en curso. Evitando interferencias.');
        return;
      }

      try {
        const user = session.user;
        console.log('[AuthFacade] Procesando evento de autenticación para el usuario:', user.id);

        // Siempre sincronizar el estado (tanto en auto-restore como en login activo)
        console.log('[AuthFacade] Guardando session y user en storage...');
        await this.services.setStorage('session', session);
        await this.services.setStorage('user', user);
        this.authState.isLogin = true;
        console.log('[AuthFacade] Estado isLogin establecido a true.');

        // Garantizar que el perfil exista en nuestra tabla (para CUALQUIER provider)
        console.log('[AuthFacade] Llamando a ensureUserProfile...');
        await this.ensureUserProfile(user);
        console.log('[AuthFacade] ensureUserProfile completado.');

        // Solo navegar si hay una ruta pendiente (ej. login con Google).
        // Si no hay intendedRoute, el usuario ya está en /tabs/fonts por defecto
        // y re-navegar destruiría el mapa a medio inicializar.
        console.log('[AuthFacade] intendedRoute actual:', this.authState.intendedRoute);
        if (this.authState.intendedRoute) {
          const route = this.authState.intendedRoute;
          console.log('[AuthFacade] Navegando a ruta pendiente (navigateRoot):', route);
          this.authState.intendedRoute = null;
          this.navCtrl.navigateRoot(route);
        } else {
          console.log('[AuthFacade] No hay intendedRoute. No se fuerza navegación.');
        }
      } catch (e) {
        console.error('[AuthFacade] Error en initOAuthListener:', e);
      }
    });
  }

  async login(email: string, password: string): Promise<boolean> {
    // Activar flag para que initOAuthListener NO interfiera — login() gestiona todo
    this.isManualLogin = true;

    try {
      const response = await this.authService.signIn(email, password);
      
      if (response && response.user) {
        const { user, session } = response;
        
        await this.services.setStorage('session', session);
        await this.services.setStorage('user', user);
        this.authState.isLogin = true;

        if (session) {
          this.expirationTime = Date.now() + session.expires_in * 1000;
          this.startTimer();
        }

        // Garantizar que el perfil exista (por si se perdió o nunca se creó)
        try {
          await this.ensureUserProfile(user);
        } catch(e) {
          console.error('[AuthFacade] Error asegurando perfil en login:', e);
        }

        const route = this.authState.intendedRoute || '/tabs/fonts';
        this.authState.intendedRoute = null;
        this.navCtrl.navigateRoot(route);
        return true;
      } else {
        throw new Error("Wrong credentials");
      }
    } catch (error) {
      this.showError(this.translate.instant('wrong_credentials'));
      return false;
    } finally {
      this.isManualLogin = false;
    }
  }

  async loginWithGoogle() {
    try {
      const isWeb = Capacitor.getPlatform() === 'web';
      const redirectTo = isWeb 
        ? 'https://map-font.vercel.app' 
        : 'com.mapfont://';

      // Fijar la ruta destino para que initOAuthListener sepa que debe navegar
      // tras el callback de Google (solo navega si hay intendedRoute).
      if (!this.authState.intendedRoute) {
        this.authState.intendedRoute = '/tabs/fonts';
      }

      const { data, error } = await this.authService.signInWithGoogle(redirectTo);
      if (error) {
        this.authState.intendedRoute = null;
        this.showError(this.translate.instant('wrong_credentials'));
      }
    } catch (error) {
      this.authState.intendedRoute = null;
      this.showError(this.translate.instant('wrong_credentials'));
    }
  }

  async register(email: string, password: string, username: string, location: any): Promise<boolean> {
    // Activar flag para que initOAuthListener NO interfiera
    this.isRegistering = true;

    await this.loadingService.show(this.translate.instant('loading'));

    try {
      const response = await this.authService.signUp(email, password);
      
      if (response && response.user) {
        // Usar upsert para protegernos contra duplicados si el listener llegó antes
        await this.userRepository.upsertUserType({
          admin_role: false,
          user_role: true,
          autencationUserID: response.user.id
        });

        await this.userRepository.upsertUser({
          email: email,
          location: {
            "latitude": location.coords.latitude,
            "longitude": location.coords.longitude
          },
          username: username || '',
          name: '',
          lastname: '',
          number: 0,
          address: '',
          password: password,
          autencationUserID: response.user.id,
          language: this.translate.currentLang || this.translate.getDefaultLang() || 'es'
        });

        await this.services.setStorage('session', response.session);
        await this.services.setStorage('user', response.user);
        this.authState.isLogin = true;

        const route = this.authState.intendedRoute || '/tabs/fonts';
        this.authState.intendedRoute = null;
        this.navCtrl.navigateRoot(route);
        return true;
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      return false;
    } finally {
      this.isRegistering = false;
      await this.loadingService.hide();
    }
    return false;
  }

  async requestPasswordRecovery(email: string): Promise<boolean> {
    await this.loadingService.show(this.translate.instant('loading') || 'Enviando...');

    try {
      await this.authService.requestOTP(email);
      return true;
    } catch (error) {
      this.showError("No se pudo enviar el código al correo.");
      return false;
    } finally {
      await this.loadingService.hide();
    }
  }

  async verifyRecoveryCode(email: string, token: string): Promise<boolean> {
    await this.loadingService.show(this.translate.instant('loading') || 'Verificando...');

    try {
      const response = await this.authService.verifyOTP(email, token);
      if (response && response.user) {
        const { user, session } = response;
        await this.services.setStorage('session', session);
        await this.services.setStorage('user', user);
        this.authState.isLogin = true;
        return true;
      }
      return false;
    } catch (error) {
      this.showError("El código ingresado es incorrecto o ha caducado.");
      return false;
    } finally {
      await this.loadingService.hide();
    }
  }

  async updateRecoveredPassword(newPassword: string): Promise<boolean> {
    await this.loadingService.show(this.translate.instant('loading') || 'Actualizando...');

    try {
      const response = await this.authService.updateUser({ password: newPassword });
      if (response === 'Success') {
        const userId = await this.getCurrentUserId();
        if (userId) {
           await this.userRepository.updateUser(userId, { password: newPassword } as any);
        }
        
        const route = this.authState.intendedRoute || '/tabs/fonts';
        this.authState.intendedRoute = null;
        this.navCtrl.navigateRoot(route);
        return true;
      }
      return false;
    } catch {
      this.showError("Hubo un error guardando tu contraseña.");
      return false;
    } finally {
      await this.loadingService.hide();
    }
  }

  async logout() {
    try {
      await this.authService.signOut();
    } catch {}
    this.clearAccessToken();
    this.authState.isLogin = false;
  }

  private startTimer() {
    if (this.expirationTime) {
      const timeToExpiration = this.expirationTime - Date.now();
      if (timeToExpiration > 0) {
        this.timerId = setInterval(() => {
          if (this.expirationTime) {
            const remainingTime = this.expirationTime - Date.now();
            if (remainingTime <= 0) {
              this.logout();
            }
          }
        }, 1000);
      }
    }
  }

  public clearAccessToken() {
    this.expirationTime = undefined;
    this.services.removeStorage('user');
    this.services.removeStorage('session');
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  /**
   * Obtiene el ID del usuario autenticado.
   * Fuente de verdad: supabase.auth.getUser() (sesión real del servidor).
   * Fallback: cache local (para cuando no hay conexión).
   */
  async getCurrentUserId() {
    // 1. Intentar obtener de la sesión real de Supabase (fuente de verdad)
    try {
      const { data: { user }, error } = await this.authService.getUser();
      if (!error && user) {
        return user.id;
      }
    } catch {}

    // 2. Fallback al cache local
    const user = await this.services.getStorage('user');
    return user ? user.id : null;
  }

  async getCurrentUserEmail() {
    // 1. Intentar obtener de la sesión real de Supabase
    try {
      const { data: { user }, error } = await this.authService.getUser();
      if (!error && user) {
        return user.email;
      }
    } catch {}

    // 2. Fallback al cache local
    const user = await this.services.getStorage('user');
    return user ? user.email : null;
  }

  private async showError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
}
