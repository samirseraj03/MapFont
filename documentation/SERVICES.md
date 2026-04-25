# Documentación de Facades & Repositories

En MapFont, la capa de datos es estrictamente bidireccional mediante abstracción separada.

---

## 🤵 Capa de Fachadas (Camareros)
Se encargan de ejecutar las validaciones complejas de negocio requeridas por los Componentes UI, aislando de toda configuración u obtención nativa de LocalStorage a la Vista final.

### 1. `AuthFacade` & `SecurityFacade`
*   Gobierna el flujo de inicio de sesión, el cierre temporal o expirado. 
*   **Encargado Principal**: Retorna la sesión de usuario de forma segura con `getCurrentUserId()` absorbiendo el chequeo constante de Capable Storage, reduciendo inyecciones espagueti.

### 2. `WaterSourceFacade`
*   Unifica la obtención de manantiales y fuentes en el Mapa.
*   **Zonas Exploradas**: Internamente revisa a través de la API `getLastUpdateDate()` si MapFont requiere re-descargar los GeoJSON cacheados de las fuentes locales y Supabase para equilibrar el consumo.

### 3. `FormFacade` & `UserFacade`
*   Procesos subyacentes como validación de donaciones, configuraciones o administración de formularios aprobados/pendientes listos para publicar al mapa nativo.

---

## 🔪 Capa de Repositorios (Chefs)
Interacciones planas con `SupabaseClientService`. Son ajenos al Componente o Fachadas abstractas.

### 1. `WaterSourceRepository`
*   **CRUD Puro**: Interactúa con la tabla `watersources` y `savedfountains`.
*   Extrae unicamente arrays brutos de información para su parseo en capas superiores.

### 2. `UserRepository`
*   Modificación de contraseñas u obtención exclusiva de metadatos del usuario adjunto (foto, alias, email) en la tabla relacional de negocio interna.

### 3. `FormRepository`
*   Encargado del almacenamiento en estado "revisión" de nuevas fuentes remitidas por usuarios para ser revisadas administrativamente en `forms`.

### 4. `StorageRepository`
*   Almacenamiento exclusivo físico de avatares fotográficos y fotos de las fuentes en localizaciones de Storage Bucket y mitigación de conflictos.
