# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-03-20

### Added

- Video preview and playback for MP4 and WebM files
- Video streaming with Range request support for instant playback
- Purple video icon for video files in file browser
- Detailed error messages for video playback failures (codec issues, network errors)

### Changed

- File type detection now uses S3 content-type for files without extensions
- Preview panel displays video player with native controls (play/pause, seek, volume, fullscreen)

## [1.0.0] - 2026-03-18

### Added

- Initial release
- Column-based S3 bucket browser (Finder-style navigation)
- Multi-credential file support with AES-256-GCM encryption
- Image preview for PNG, JPG, JPEG, GIF, WebP, SVG
- Text preview for TXT, JSON, MD, YAML, YML, XML, CSV, LOG
- JSON syntax highlighting and formatting
- File metadata display (size, last modified, content type)
- File download with proper Content-Disposition headers
- Connection groups with color coding
- Drag-and-drop reordering of connections
- Column compaction for deep navigation
- Support for S3-compatible services (AWS, MinIO, Cloudflare R2, etc.)
