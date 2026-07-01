# Notas para Agentes (Agent Notes)

Este archivo documenta optimizaciones críticas y decisiones arquitectónicas específicas de la aplicación para prevenir que futuros agentes deshagan estos cambios por error o desconozcan el contexto.

## 1. Integración con OpenStreetMap (Overpass API)
**Problema original:** OSM bloqueaba constantemente las solicitudes (HTTP 429/403) cuando la aplicación se desplegaba en Vercel, ya que el navegador no puede inyectar libremente un `User-Agent` personalizado y los servidores gratuitos como Vercel/GitHub Pages son bloqueados por abuso en la API pública de Overpass.
**Solución actual:**
- Se implementó una **Vercel Serverless Function** en la raíz del proyecto (`api/osm.js`).
- Este proxy intercepta las llamadas, inyecta un `User-Agent` válido (`MapFont-App/1.0 (Contact: admin@mapfont.vercel.app)`), y tramita la petición a OSM desde el backend de Vercel.
- En `src/app/core/services/osm.service.ts`, el endpoint `https://map-font.vercel.app/api/osm` se colocó como la **primera opción (índice 0)** en la lista de `overpassEndpoints`.
**Regla para agentes:** NO ELIMINAR el proxy `api/osm.js` ni cambiar el endpoint en el frontend, ya que esto romperá el acceso al mapa en producción.

## 2. Inicialización del Mapa en `Fonts.page.ts`
**Problema original:** Hubo un intento fallido de usar mecanismos de polling (reintentos de espera DOM con `setTimeout` o `requestAnimationFrame`) para instanciar el contenedor `Mapa-de-box`.
**Decisión arquitectónica:**
- `ionViewDidEnter` por diseño en Ionic ya garantiza que la vista y el DOM han terminado de cargar. No es necesario añadir delays, reintentos ni bloqueos artificiales.
- El código de instanciación del mapa de MapBox se ha mantenido lo más plano y síncrono posible para asegurar que el despliegue del mapa sea instantáneo sin latencias innecesarias o "parpadeos".
**Regla para agentes:** NO AGREGAR lógica de espera artificial (timeouts, requestAnimationFrames infinitos) a la inicialización del mapa. Si el mapa desaparece al navegar, el problema reside en el manejo del ciclo de vida de Ionic (`ionViewDidLeave` o persistencia del contenedor), NO en añadir delays a la carga inicial.

## 3. Retraso (Delay) en el Login - `AuthFacade`
**Problema original:** Iniciar sesión tardaba mucho tiempo en redirigir al mapa. Esto ocurría porque la función asíncrona `ensureUserProfile(user)` (que hace múltiples peticiones a la BD) bloqueaba la navegación mediante `await`.
**Solución actual:**
- En `src/app/core/facades/auth.facade.ts` se retiró el `await` de `this.ensureUserProfile(user)` tanto en `login()` como en `initOAuthListener()`.
- Ahora, la validación/creación del perfil de usuario en la base de datos se ejecuta en *segundo plano*, permitiendo que el comando `navCtrl.navigateRoot()` se ejecute inmediatamente.
**Regla para agentes:** NO VOLVER A PONER un `await` en llamadas de sincronización de BD dentro de flujos críticos de UX (como el botón de Login), a menos que esa data sea absolutamente bloqueante para renderizar la siguiente vista.
