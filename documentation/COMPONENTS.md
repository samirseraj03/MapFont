
# Reglas de Arquitectura del Proyecto (MapFont)

1. TECNOLOGÍA PRINCIPAL: Utilizamos Angular con **Standalone Components** (nada de NgModules) e Ionic Framework. 
2. BASE DE DATOS: Usamos Supabase con el SDK `@supabase/supabase-js`. NO uses AngularFire ni RxJS para las peticiones de Supabase a menos que sea estrictamente necesario.
3. SEGURIDAD (RLS): Todas las inserciones a las tablas `users` y `usertype` DEBEN incluir explícitamente el `autencationUserID` obtenido tras el registro.
4. ROLES: Al crear un usuario nuevo en `usertype`, siempre se debe mandar `admin_role: false`.
5. UX: Todas las promesas asíncronas deben tener `try/catch/finally` y gestionar correctamente los `LoadingController` de Ionic.


# Project Components & Pages

Tras seguir los principios SOLID, todas las Vistas/Componentes de la aplicación delegan la orquestación a sus respectivos Facades evitando tocar los repositorios nativamente.

## 1. El Embud de Formularios (Form Wizard)
Aproximación por 3 Pasos aislados donde se inyecta centralmente la fachada de UI y lógica.

### `FormUploadImage`
*   **Rol**: Captura la fotografía de acceso, delega la subida asíncrona al `FormFacade` e inyecta retornos temporales en variables de paso.

### `FormSelectLocation`
*   **Rol**: Renderización GPS. A través del mapa embebido retorna `[mylongitude, mylatitude]`. Solamente interactúa con `GeolocationService` desde las entrañas.

### `FormInsertInformation`
*   **Rol**: Pantalla Final enviadora del Objeto. Notifica a su Fachada de inyección el objeto con las 3 variables sin encargarse de notificaciones directas ni de DB pura.

## 2. Mapa Principal (Map & Listados)
### `Fonts.page.ts`
*   Cargador cartográfico. Solamente consume un solo objeto fundamental `WaterSourceFacade` quien le entrega empaquetadas en bandeja de plata todas las lecturas cartográficas listísimas para ser pintadas de forma visual sin enjuiciar tiempos de espera ni Storage interno o revisiones.

## Reglas Inquebrantables de los Componentes Generales
- Las vistas inician de `load*` (e.g. `this.facade.loadSavedData()`).
- Estrictamente desacopladas para ser escalables con pruebas unitarias de su lógica HTML sin mockear bases de datos enteras.
