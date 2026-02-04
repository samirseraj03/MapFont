# Services Documentation

## 1. DatabaseService (`src/app/Types/SupabaseService.ts`)

This service is the core communication layer with Supabase. It manages data consistency and API calls.

### Core Architecture
*   **Client**: Initializes `SupabaseClient` with environment keys.
*   **Auth Options**: Configured with `autoRefreshToken: false` and `persistSession: true`.

### Key Methods

#### User Management
*   `insertUser(newUser: User)`: Adds a new user profile after signup.
*   `updateUser(userId, updatedUser)`: Modifies user profile data.
*   `getUser(auth_id)`: Fetches user profile by their Authentication ID.

#### Water Sources (Fuentes)
*   `getWaterSources()`: Retrieves all public water sources.
*   `insertWaterSource(newSource)`: (Admin/System) Adds a verified source.
*   `getSavedFoutains(user_id)`: Recovers the list of fountains saved/favorited by a user.
    *   *Logic*: Fetches `savedfountains` table > extracts IDs > matches with `watersources` table.

#### Forms (Submissions)
*   `insertForm(newForm)`: Submits a new water source for review.
    *   *Flow*: User submits > Stored in `forms` table > Admin approves > Moved to `watersources`.
*   `getFormsUser(user_id)`: Gets submissions made by a specific user.

#### Storage (Images)
*   `InsertToStoarge(file)`: Uploads an image to the `ImageWaterSource` bucket.
    *   *Sanitization*: Uses `esNombreArchivoValido` to clean filenames (replaces `/`, `:`, spaces, etc.).
    *   *Collision Handling*: If file exists, appends timestamp and coordinates to ensure uniqueness.
*   `GetStorage(url_image)`: Returns the public URL for a stored image.

---

## 2. GeolocationService (`src/app/Globals/Geolocation.ts`)

Wrapper around `@capacitor/geolocation` to handle cross-platform differences.

### Key Features
*   **Hybrid Support**: Handles both Web (`navigator.geolocation`) and Native (`Capacitor.isNativePlatform()`).
*   **Permission Handling**:
    *   `checkLocationPermission()`: Checks status.
    *   `requestLocationPermission()`: Prompts user if status is 'prompt'.

### Methods
*   `getGeolocation()`: Main entry point.
    1.  Checks platform.
    2.  Checks permissions.
    3.  Returns coordinates (`coords.latitude`, `coords.longitude`) and updates internal state.
*   `generateGoogleMapsLink(lat, lng)`: Utility to create external map links.

---

## 3. Services (`src/app/services.service.ts`)

General utility and state management service.

### Features
*   **Local Storage**: Wrapper around `@capacitor/preferences` for persistent data (e.g., `setStorage`, `getStorage`).
*   **Update Checking**: `CheckLatestUpdateFontains()`
    *   Compares local data version (`dateGeoJson`) with server version.
    *   Returns `true` if update is needed, saving bandwidth by not re-fetching static data unnecessarily.
