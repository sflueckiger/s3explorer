## 1. Backend - Video Preview Support

- [x] 1.1 Add video extensions (mp4, webm) to PREVIEW_EXTENSIONS in files.ts
- [x] 1.2 Add "video" preview type to getPreviewType function in files.ts
- [x] 1.3 Ensure /file/:connId/* endpoint returns correct Content-Type for video streaming

## 2. Frontend - Video Player Component

- [x] 2.1 Add isVideo helper function in PreviewPanel.tsx to detect video types
- [x] 2.2 Add HTML5 video element with native controls to PreviewPanel.tsx
- [x] 2.3 Style video player to fit preview panel (max-height, object-contain)
- [x] 2.4 Add video error handling (onError event) with error message display

## 3. Frontend - File Icons

- [x] 3.1 Add video file icon (purple video icon) for mp4/webm files in ColumnBrowser.tsx
- [x] 3.2 Add video file icon to PreviewPanel.tsx metadata section

## 4. Testing

- [x] 4.1 Test mp4 video playback with controls (manual - requires S3 bucket with video files)
- [x] 4.2 Test webm video playback with controls (manual - requires S3 bucket with video files)
- [x] 4.3 Test unsupported video format (mov, avi) shows metadata only (manual - requires S3 bucket with video files)
- [x] 4.4 Test video error handling (network error, access denied) (manual - requires S3 bucket with video files)
