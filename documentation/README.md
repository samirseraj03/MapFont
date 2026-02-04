# MapFont Project Documentation

## 1. Introduction
**MapFont** is an Ionic/Angular application designed to map and manage water sources (fountains). It allows users to view, add, and manage water sources on a map. The application utilizes geolocation to find nearby sources and provides a multi-step form to contribute new data.

## 2. Technology Stack

### Frontend
*   **Framework**: Ionic 7 + Angular 17
*   **Language**: TypeScript
*   **Styling**: SCSS / Ionic Utilities

### Backend & Services
*   **Database & Auth**: Supabase (PostgreSQL)
*   **Storage**: Supabase Storage (for images)
*   **Maps**: Mapbox GL JS

### Mobile / Native
*   **Runtime**: Capacitor 6
*   **Plugins**:
    *   `@capacitor/camera`: For taking photos of fountains.
    *   `@capacitor/geolocation`: For device location.
    *   `@capacitor/preferences`: For local storage (settings, caching).

## 3. Key Features
*   **Geolocation**: Locate users and nearby water sources.
*   **Map Interface**: Visualization of fountains using Mapbox.
*   **Contribution Flow**: Multi-step wizard to add new fountains (Photo -> Location -> Details).
*   **Authentication**: User login/signup via Supabase.
*   **Offline Support**: (Partial) Local caching of updates.

## 4. Documentation Structure
This folder contains detailed documentation for different aspects of the project:

*   **[Setup Guide](SETUP_GUIDE.md)**: Instructions to install and run the project.
*   **[Project Structure](PROJECT_STRUCTURE.md)**: Overview of folders and files.
*   **[Components](COMPONENTS.md)**: Details on the UI components and pages.
*   **[Services](SERVICES.md)**: Explanation of backend integration and logic services.
*   **[Workflows](WORKFLOWS.md)**: Walkthrough of complex user flows (e.g., adding a fountain).
