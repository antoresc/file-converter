/**
 * Handles image format conversions between JPG, PNG, and WebP
 */
export class ImageConverter {
  /**
   * Converts an image file to the target format
   * @param {File} file - The source image file
   * @param {string} targetFormat - The target format (jpg, png, webp)
   * @param {number} quality - Quality setting for compression (0.0-1.0)
   * @returns {Promise<File>} - Promise resolving to the converted file
   */
  static async convert(file, targetFormat, quality = 0.8) {
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      throw new Error('The provided file is not an image');
    }
    
    // Create a canvas element for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Load the image
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          // Set canvas dimensions to match the image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw the image on the canvas
          ctx.drawImage(img, 0, 0);
          
          // Convert the canvas to the target format
          let blob;
          let mimeType;
          
          switch (targetFormat.toLowerCase()) {
            case 'jpg':
            case 'jpeg':
              mimeType = 'image/jpeg';
              blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType, quality));
              break;
            case 'png':
              mimeType = 'image/png';
              blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType));
              break;
            case 'webp':
              mimeType = 'image/webp';
              blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType, quality));
              break;
            default:
              throw new Error(`Unsupported target format: ${targetFormat}`);
          }
          
          // Create a new file from the blob
          const fileName = file.name.split('.')[0];
          const newFile = new File([blob], `${fileName}.${targetFormat}`, { type: mimeType });
          
          resolve(newFile);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load the image'));
      };
      
      // Set the image source to the file
      img.src = URL.createObjectURL(file);
    });
  }
  
  /**
   * Creates a preview of the image
   * @param {File} file - The image file to preview
   * @returns {Promise<HTMLImageElement>} - Promise resolving to the image element
   */
  static createPreview(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to create image preview'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
} 