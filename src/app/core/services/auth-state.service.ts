import { Injectable } from '@angular/core';

/**
 * Servicio compartido para el estado de autenticación.
 * Reemplaza la inyección directa de TabsPage en LoginPage/RegisterPage
 * (que causaba NullInjectorError porque TabsPage es un Component, no Injectable).
 */
@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  /** true si el usuario ha iniciado sesión */
  isLogin = false;

  /** Ruta a la que redirigir tras login (ej: '/tabs/form' o '/tabs/configuration') */
  intendedRoute: string | null = null;
}
