# Application Workflows

## 1. Adding a Water Source (The "Contribution" Flow)

This is the primary user interaction for contributing data.

### Flow Diagram
1.  **Start**: User clicks "Add" -> Navigates to `FormUploadImage`.
2.  **Image Capture**:
    *   *Option A (Gallery)*: User picks file -> `handleFileInput` reads it directly.
    *   *Option B (Camera)*: User takes photo -> `takePicture` captures it.
        *   **CRITICAL**: The camera returns a URI. The app fetches this URI, converts it to a Blob/File, and stores it in memory.
3.  **Location**:
    *   Navigates to `FormSelectLocation`.
    *   Map loads user position.
    *   User confirms marker position.
4.  **Details**:
    *   Navigates to `FormInsertInformation`.
    *   User fills text fields.
5.  **Submit**:
    *   Image is uploaded to bucket `ImageWaterSource`.
    *   Metadata + Image Path is saved to database.

## 2. Image Handling & Storage Logic

### Challenge
Mobile devices (Capacitor) and Web Browsers handle files differently.
*   **Web**: `<input type="file">` returns a `File` object immediately.
*   **Mobile Camera**: Returns a path (`file://` or `http://localhost...`).

### Solution
The application explicitly normalizes these inputs.
```typescript
// Camera Logic Normalization
const response = await fetch(image.webPath);
const blob = await response.blob();
const file = new File([blob], "filename.jpg", { type: blob.type });
```
This ensures that the `DatabaseService.InsertToStoarge()` always receives a valid `File` object, regardless of source.

### Storage Path
Images are stored in Supabase Storage with sanitized names to preventing URL issues.
*   **Bucket**: `ImageWaterSource`
*   **Naming**: `_mapfont_[timestamps]_[original_name]` (if duplicate).
