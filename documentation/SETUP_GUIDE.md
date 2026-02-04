# Setup and Installation Guide

## Prerequisites
Ensure you have the following installed:
*   **Node.js** (LTS version recommended)
*   **npm** (Node Package Manager)
*   **Ionic CLI**: `npm install -g @ionic/cli`

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd MapFont
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

## Environment Configuration
The application requires API keys for Supabase and Mapbox. These are located in `src/environments/environment.ts`.

> **Note**: In a production environment, ensure sensitive keys are handled securely.

Required keys:
*   `accessToken`: Mapbox Access Token.
*   `SUPABASE_URL`: URL of your Supabase project.
*   `SUPABASE_KEY`: Anonymous public key for Supabase.

## Running the App

### Development Server (Browser)
To run the app in the browser with live reload:
```bash
ionic serve
```

### Android / iOS
To build for mobile devices, you need Android Studio or Xcode.

1.  **Sync Capacitor config**:
    ```bash
    npx cap sync
    ```

2.  **Open native IDE**:
    ```bash
    npx cap open android
    # or
    npx cap open ios
    ```

3.  **Run**: Use the IDE's "Run" button to deploy to a device or emulator.
