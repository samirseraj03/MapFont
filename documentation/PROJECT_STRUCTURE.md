# Project Structure

## Resumen de Directorios

```text
src/
├── app/                        # Main Application Logic
│   ├── pages/                  # Vistas y Pantallas UI (Clientes)
│   │   ├── auth/               # Pantallas Login/Register
│   │   ├── configuration/      # Panel de Configuración (User, Security, Sources)
│   │   ├── form/               # Wizard de subición de formas
│   │   └── map/                # Mapa Interactivo principal (Fonts)
│   └── core/                   # Núcleo de la Aplicación y Arquitectura
│       ├── facades/            # Camareros (Orquestadores de Negocio y Estados)
│       ├── repositories/       # Chefs (Acceso a Base de Datos Puro)
│       ├── models/             # Tipado Fuerte de DB y Aplicación
│       ├── services/           # Utilidades sin Dominio y Core (Authentication)
│       ├── guards/             # Routers de Acceso
│       └── utils/              # Funciones Globales Wrapper (GeolocationService)
├── assets/                     # Archivos Estáticos e Iconos
├── environments/               # Variables Keys Globales
└── theme/                      # CSS Globales (variables.scss)
```

## Directorios Clave y Arquitectura Limpia

El proyecto ha evolucionado para seguir unas estrictas y escalables directrices arquitectónicas, abandonando el God Object (`SupabaseService`) en pro del patrón **Cliente-Camarero-Chef**:

### 1. `src/app/pages/` (Los Clientes)
Contiene las interfaces `.page.ts`. Su responsabilidad **EXCLUSIVA** es renderizar diseño HTML/SCSS, enlazar eventos (clicks), y llamar a un Facade determinado.
**Tienen PROHIBIDO Inyectar bases de datos directas.**

### 2. `src/app/core/facades/` (Los Camareros)
Agrupan la lógica de interrelación UI-Datos. Procesadores de las vistas. Manejan loaders, transformaciones lógicas (ej: buscar id a través de tokens) o guardado en caché antes de recurrir a bases de datos en la nube de forma transparente a la vista.

### 3. `src/app/core/repositories/` (Los Chefs)
Cada Chef se responsabiliza exclusivamente de llamar a Supabase en su área asignada. Realiza únicamente Inserciones, Gets o Updates a su respectiva tabla:
*   `UserRepository`
*   `WaterSourceRepository`
*   `FormRepository`
*   `StorageRepository`

### 4. `src/app/core/utils/`
Contiene servicios puente globales. Por ejemplo: `GeolocationService`. Es un empaquetador genérico de capacitor que facilita cálculos GPS cruzados u obtención de latitud/longitud global.
