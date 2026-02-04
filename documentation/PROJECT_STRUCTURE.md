# Project Structure

## Directory Overview

```
src/
├── app/                  # Main Application Logic
│   ├── authentication/   # Login/Register Pages and Components
│   ├── ConfigurationPage/# User Settings Page
│   ├── Fonts/            # List/View of Water Sources (Fuentes)
│   ├── Form/             # "Add Water Source" Wizard
│   │   ├── FormUploadImage/       # Step 1: Photo
│   │   ├── FormSelectLocation/    # Step 2: Location (Map)
│   │   ├── FormInsertInformation/ # Step 3: Details
│   │   ├── confirmation-form/     # Success/Confirmation
│   │   └── view-form/             # View specific form details
│   ├── Globals/          # Global Utilities (Geolocation)
│   ├── Types/            # Interfaces and Database Services
│   ├── services.service.ts       # Shared Local State/Storage
│   └── authentication.service.ts # Auth Logic
├── assets/               # Static Assets (Images, Icons)
├── environments/         # Config (API Keys)
└── theme/                # Global Styles (variables.scss)
```

## Key Directories

### `src/app/Form`
Contains the logic for the "Add Fountain" feature. It is split into multiple pages using a wizard-like flow.
*   **FormUploadImage**: Handles capturing photos via Camera or Gallery.
*   **FormSelectLocation**: Interactive Mapbox map to pin the fountain's location.
*   **FormInsertInformation**: Form inputs for name, description, potability, etc.

### `src/app/Types`
Contains the **Data Layer**.
*   **SupabaseService.ts**: The main class `DatabaseService` handles all interaction with the Supabase backend (CRUD for Users, WaterSources, Forms).
*   **Interfaces**: Defines TypeScript interfaces like `User`, `WaterSources`, `Forms`.

### `src/app/Globals`
Contains **GeolocationService**.
*   Wrapper for `@capacitor/geolocation`.
*   Handles permissions (Web vs Native).
*   Provides current coordinates.
