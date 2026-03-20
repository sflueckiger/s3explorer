## Context

The S3 Explorer currently supports image and text previews in the PreviewPanel component. Video content types are already mapped in the backend (`files.ts`), but no preview logic exists. The preview type detection returns only `"image"` or `"text"`, with no `"video"` type. Users must download video files to view them.

## Goals / Non-Goals

**Goals:**
- Stream video files directly from S3 for inline preview
- Provide standard playback controls (play/pause, seek, volume, fullscreen)
- Support common web-compatible video formats (mp4, webm)
- Define reasonable size limits for video streaming

**Non-Goals:**
- Video transcoding or format conversion
- Support for non-web formats (mkv, avi, mov require transcoding)
- Video thumbnails in file listing
- Playlist or multi-video playback

## Decisions

### 1. Supported Formats: MP4 and WebM only

**Rationale**: These are the only formats with universal browser support. Other formats (mkv, avi, mov) would require server-side transcoding which adds complexity and cost.

**Alternatives considered**:
- Support all video formats via transcoding → Too complex, requires ffmpeg infrastructure
- Support mov via Safari → Inconsistent cross-browser experience

### 2. Use HTML5 `<video>` element with native controls

**Rationale**: Browser-native controls are accessible, familiar, and zero-dependency. They handle play/pause, seek, volume, and fullscreen out of the box.

**Alternatives considered**:
- Custom video player (video.js, plyr) → Adds dependency, complexity for minimal benefit
- React-player → Overkill for simple S3 streaming

### 3. Stream directly from backend, no size limit on streaming

**Rationale**: Videos are streamed, not loaded into memory. The browser handles buffering. Unlike images (loaded entirely) or text (parsed), video streaming is incremental.

**Alternatives considered**:
- Impose size limit like images (10MB) → Would prevent most video previews
- Pre-buffer entire video → Memory issues on large files

### 4. Add `previewType: "video"` to backend metadata response

**Rationale**: Follows existing pattern. Frontend already switches on `previewType` to determine rendering. Adding `"video"` is consistent with `"image"` and `"text"`.

### 5. Reuse existing streaming endpoint `/file/:connId/*`

**Rationale**: This endpoint already streams files. For video, we only need to ensure proper Content-Type headers for browser playback. No new endpoint needed.

## Risks / Trade-offs

**[Risk] Non-web formats show as unsupported** → Mitigation: Clear UX indicating format not supported for preview, offer download. Document supported formats.

**[Risk] Large videos may buffer slowly on slow connections** → Mitigation: Browser handles buffering natively; this is expected behavior for streaming media.

**[Trade-off] No thumbnails in file listing** → Keeps scope small. Can be added later with server-side frame extraction if needed.
