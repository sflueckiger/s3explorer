## Why

The S3 Explorer currently supports image and text previews but lacks video support, despite having video content types already mapped in the backend. Users browsing S3 buckets containing video files cannot preview them inline and must download files to check their contents.

## What Changes

- Add video preview rendering in the PreviewPanel component using HTML5 `<video>` element
- Enable video playback controls (play/pause, seek, volume, fullscreen)
- Add video file type detection in the backend preview type logic
- Add video-specific file icons in the file listing
- Define size limits for video streaming preview

## Capabilities

### New Capabilities

- `video-preview`: Stream and display video files inline with playback controls

### Modified Capabilities

- `file-preview`: Add video as a supported preview type alongside images and text

## Impact

- Frontend: `PreviewPanel.tsx` - add video rendering logic
- Backend: `files.ts` - add video to preview types and streaming logic
- Spec: `file-preview/spec.md` - updated requirements for video support
