# File Converter Web App

A client-side file conversion web application that allows users to convert between various file formats without any server processing. All conversions happen directly in the browser.

## Supported Conversions

- **Images**: JPG ↔ PNG ↔ WebP (80% quality default)
- **Video**: MP4 → GIF (5 seconds clip maximum)
- **PDF**: PDF → JPG (First page only)

## Features

- **Drag-and-drop** interface for easy file uploads
- **Format-specific previews** for all supported file types
- **Ad placeholder slots** (3 positions: header, post-conversion, footer)
- **Mobile-responsive** design that works on all devices
- **Client-side only** processing with zero server requirements

## Setup

1. Clone the repository to your local machine.
2. No build step required! This is a pure HTML/JS/CSS application.
3. Open `public/index.html` in a modern web browser to use the app.

### Dependencies

The application uses the following libraries (loaded via CDN):

- PDF.js for PDF processing
- FFmpeg.wasm for video processing
- FileSaver.js for saving converted files

## File Structure

```
public/
  index.html               # Main HTML file
  styles/
    converter.css          # Styles for the app
src/
  converters/
    ImageConverter.js      # Handles image conversions
    VideoConverter.js      # Handles video to GIF conversion
    PDFConverter.js        # Handles PDF to JPG conversion
  utils/
    fileValidator.js       # Validates file types and sizes
  main.js                  # Main application logic
```

## Critical Paths

- Video processing: `src/converters/VideoConverter.js:12-25`
- PDF render config: `src/converters/PDFConverter.js:9-11`

## Limitations

- **Video length**: Maximum 5 seconds for GIF conversion (client memory constraints)
- **File sizes**:
  - Images: 10MB maximum
  - Videos: 50MB maximum
  - PDFs: 20MB maximum
- **Browser compatibility**: Requires modern browsers with Web Workers and Canvas support
- **FFmpeg.wasm**: Requires Chrome 85+ for optimal performance

## Ad Implementation

1. Replace ad placeholder divs (`ad-header`, `ad-results`, and `ad-footer`) with your advertising platform tags.
2. The app triggers a `window.conversionComplete` event after each successful conversion, which can be used to refresh ads.

## Future Enhancements

- Add WebP support in `ImageConverter.js`
- Implement progress bars for all conversion types
- Expand PDF page selection in `PDFConverter.js` to allow selecting specific pages

## Browser Compatibility

The app works best on:
- Chrome 85+
- Firefox 80+
- Safari 14+
- Edge 85+

## License

MIT License 