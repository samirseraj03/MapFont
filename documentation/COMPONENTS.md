# Components & Pages Documentation

## 1. Submission Form (The Wizard)
The process of adding a new water source is split into three distinct pages to improve user experience.

### Step 1: Upload Image (`FormUploadImage`)
*   **Path**: `src/app/Form/FormUploadImage`
*   **Purpose**: Capture the visual evidence of the water source.
*   **Key Logic**:
    *   **Camera Integration**: Uses `Capacitor Camera.getPhoto()`.
    *   **File Handling**: Converts the raw camera blob (`webPath`) into a JavaScript `File` object using `fetch`. This is critical for the generic file upload service to work.
    *   **Navigation**: Passes the file object to the next page via generic service state (`this.Service.img_ref`) or route params.

### Step 2: Select Location (`FormSelectLocation`)
*   **Path**: `src/app/Form/FormSelectLocation`
*   **Purpose**: Pinpoint exact coordinates.
*   **Tech**: Mapbox GL JS.
*   **Features**:
    *   **Current Location**: Auto-centers on user's GPS (via `GeolocationService`).
    *   **Search**: Uses Mapbox Geocoding API (`api.mapbox.com/geocoding/v5`) to search addresses.
    *   **Pinning**: User can tap to move the marker. Returns `[mylongitude, mylatitude]`.

### Step 3: Information (`FormInsertInformation`)
*   **Path**: `src/app/Form/FormInsertInformation`
*   **Purpose**: Metadata entry.
*   **Data Points**: Name, Description, Potable (boolean), Type (Tap, Fountain, Natural).
*   **Submission**:
    1.  Uploads image to Supabase Storage.
    2.  Constructs `Forms` object.
    3.  Inserts row into `forms` table.
    4.  Redirects to Success page.

## 2. Authentication (`authentication`)
*   **Login**: Standard email/password flow.
*   **Register**: Creates new user in Supabase Auth and a corresponding row in the public `users` table with profile info.

## 3. Map / Main View (`Tabs`)
*(Inferred from project type)*
*   Displays the map of existing `watersources`.
*   Likely uses `CheckLatestUpdateFontains()` to determine if it needs to re-download the dataset.
