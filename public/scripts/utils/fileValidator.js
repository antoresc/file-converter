/**
 * Utility functions for validating files
 */

/**
 * Supported file types by format
 */
export const SUPPORTED_FORMATS = {
  jpg: { mime: 'image/jpeg', extensions: ['jpg', 'jpeg'] },
  png: { mime: 'image/png', extensions: ['png'] },
  webp: { mime: 'image/webp', extensions: ['webp'] },
  gif: { mime: 'image/gif', extensions: ['gif'] },
  mp4: { mime: 'video/mp4', extensions: ['mp4'] },
  pdf: { mime: 'application/pdf', extensions: ['pdf'] }
};

/**
 * Maximum file sizes in bytes
 */
export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  video: 50 * 1024 * 1024, // 50MB
  pdf: 20 * 1024 * 1024    // 20MB
};

/**
 * Validates file type and size
 * @param {File} file - The file to validate
 * @returns {Object} - Result object with validation status and messages
 */
export function validateFile(file) {
  const result = {
    valid: true,
    message: 'File is valid',
    type: null,
    canConvertTo: []
  };
  
  // Check if the file is too large
  if (file.type.startsWith('image/') && file.size > MAX_FILE_SIZES.image) {
    result.valid = false;
    result.message = `Image file is too large. Maximum size is ${MAX_FILE_SIZES.image / (1024 * 1024)}MB.`;
    return result;
  }
  
  if (file.type.startsWith('video/') && file.size > MAX_FILE_SIZES.video) {
    result.valid = false;
    result.message = `Video file is too large. Maximum size is ${MAX_FILE_SIZES.video / (1024 * 1024)}MB.`;
    return result;
  }
  
  if (file.type === 'application/pdf' && file.size > MAX_FILE_SIZES.pdf) {
    result.valid = false;
    result.message = `PDF file is too large. Maximum size is ${MAX_FILE_SIZES.pdf / (1024 * 1024)}MB.`;
    return result;
  }
  
  // Check if the file type is supported and determine possible conversions
  if (file.type === SUPPORTED_FORMATS.jpg.mime) {
    result.type = 'jpg';
    result.canConvertTo = ['png', 'webp'];
  } else if (file.type === SUPPORTED_FORMATS.png.mime) {
    result.type = 'png';
    result.canConvertTo = ['jpg', 'webp'];
  } else if (file.type === SUPPORTED_FORMATS.webp.mime) {
    result.type = 'webp';
    result.canConvertTo = ['jpg', 'png'];
  } else if (file.type === SUPPORTED_FORMATS.mp4.mime) {
    result.type = 'mp4';
    result.canConvertTo = ['gif'];
  } else if (file.type === SUPPORTED_FORMATS.pdf.mime) {
    result.type = 'pdf';
    result.canConvertTo = ['jpg'];
  } else {
    // Try to determine file type from extension if MIME type doesn't match
    const extension = file.name.split('.').pop().toLowerCase();
    
    for (const [format, data] of Object.entries(SUPPORTED_FORMATS)) {
      if (data.extensions.includes(extension)) {
        result.type = format;
        
        // Set possible conversions based on file type
        switch (format) {
          case 'jpg':
          case 'jpeg':
            result.canConvertTo = ['png', 'webp'];
            break;
          case 'png':
            result.canConvertTo = ['jpg', 'webp'];
            break;
          case 'webp':
            result.canConvertTo = ['jpg', 'png'];
            break;
          case 'mp4':
            result.canConvertTo = ['gif'];
            break;
          case 'pdf':
            result.canConvertTo = ['jpg'];
            break;
          default:
            break;
        }
        
        break;
      }
    }
    
    if (!result.type) {
      result.valid = false;
      result.message = 'File type is not supported. Please upload JPG, PNG, WebP, MP4, or PDF files.';
    }
  }
  
  return result;
}

/**
 * Gets available target formats for a file
 * @param {File} file - The file to check
 * @returns {Array} - Array of available target formats
 */
export function getAvailableFormats(file) {
  const validation = validateFile(file);
  return validation.valid ? validation.canConvertTo : [];
}

/**
 * Checks if conversion is valid
 * @param {File} file - The source file
 * @param {string} targetFormat - The target format
 * @returns {boolean} - Whether the conversion is valid
 */
export function isValidConversion(file, targetFormat) {
  const validation = validateFile(file);
  return validation.valid && validation.canConvertTo.includes(targetFormat);
}

/**
 * Formats file size to human-readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
} 