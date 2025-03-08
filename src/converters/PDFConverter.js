/**
 * Handles PDF to JPG conversion using PDF.js
 */
export class PDFConverter {
  /**
   * Converts the first page of a PDF to JPG
   * @param {File} file - The source PDF file
   * @param {number} quality - Quality setting for JPG output (0.0-1.0)
   * @returns {Promise<File>} - Promise resolving to the converted JPG file
   */
  static async firstPageToJpg(file, quality = 0.8) {
    // Check if the file is a PDF
    if (file.type !== 'application/pdf') {
      throw new Error('The provided file is not a PDF');
    }
    
    try {
      // Initialize PDF.js
      const pdfjsLib = window.pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js';
      
      // Load the PDF file
      const pdfUrl = URL.createObjectURL(file);
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      
      // Get the first page
      const page = await pdf.getPage(1);
      
      // Render the page to a canvas
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Render PDF page to canvas
      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;
      
      // Convert canvas to JPG
      const jpgBlob = await new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
      });
      
      // Create a file from the JPG blob
      const fileName = file.name.split('.')[0];
      const jpgFile = new File([jpgBlob], `${fileName}.jpg`, { type: 'image/jpeg' });
      
      // Clean up
      URL.revokeObjectURL(pdfUrl);
      
      return jpgFile;
    } catch (error) {
      console.error('Error in firstPageToJpg:', error);
      throw new Error(`Failed to convert PDF to JPG: ${error.message}`);
    }
  }
  
  /**
   * Creates a preview of the PDF (first page)
   * @param {File} file - The PDF file to preview
   * @returns {Promise<HTMLCanvasElement>} - Promise resolving to the canvas element
   */
  static async createPreview(file) {
    try {
      // Initialize PDF.js
      const pdfjsLib = window.pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js';
      
      // Load the PDF file
      const pdfUrl = URL.createObjectURL(file);
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      
      // Get the first page
      const page = await pdf.getPage(1);
      
      // Render the page to a canvas
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Render PDF page to canvas
      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;
      
      // Add page info if there are multiple pages
      if (pdf.numPages > 1) {
        const container = document.createElement('div');
        container.appendChild(canvas);
        
        const pageInfo = document.createElement('div');
        pageInfo.textContent = `Page 1 of ${pdf.numPages}. Note: Only the first page will be converted.`;
        pageInfo.style.marginTop = '10px';
        pageInfo.style.fontSize = '14px';
        container.appendChild(pageInfo);
        
        // Clean up
        URL.revokeObjectURL(pdfUrl);
        
        return container;
      }
      
      // Clean up
      URL.revokeObjectURL(pdfUrl);
      
      return canvas;
    } catch (error) {
      console.error('Error creating PDF preview:', error);
      throw new Error(`Failed to create PDF preview: ${error.message}`);
    }
  }
} 