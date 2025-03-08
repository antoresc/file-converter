import { ImageConverter } from './converters/ImageConverter.js';
import { VideoConverter } from './converters/VideoConverter.js';
import { PDFConverter } from './converters/PDFConverter.js';
import { validateFile, getAvailableFormats, formatFileSize } from './utils/fileValidator.js';

// DOM elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFile');
const targetFormatSelect = document.getElementById('targetFormat');
const previewContainer = document.getElementById('preview-container');
const previewElement = document.getElementById('preview');
const convertBtn = document.getElementById('convertBtn');
const resultContainer = document.getElementById('result-container');
const resultElement = document.getElementById('result');
const downloadBtn = document.getElementById('downloadBtn');

// Current file and converted file
let currentFile = null;
let convertedFile = null;

// Initialize the application
function init() {
  setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
  // Drag and drop events
  dropZone.addEventListener('dragover', handleDragOver);
  dropZone.addEventListener('dragleave', handleDragLeave);
  dropZone.addEventListener('drop', handleDrop);
  
  // Button clicks
  selectFileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);
  convertBtn.addEventListener('click', handleConversion);
  downloadBtn.addEventListener('click', handleDownload);
  
  // Format selection
  targetFormatSelect.addEventListener('change', updateConversionOptions);
}

// Handle drag over event
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('drag-over');
}

// Handle drag leave event
function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');
}

// Handle file drop event
function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');
  
  if (e.dataTransfer.files.length > 0) {
    processFile(e.dataTransfer.files[0]);
  }
}

// Handle file select via input
function handleFileSelect(e) {
  if (e.target.files.length > 0) {
    processFile(e.target.files[0]);
  }
}

// Process uploaded file
async function processFile(file) {
  try {
    // Validate file
    const validation = validateFile(file);
    
    if (!validation.valid) {
      showError(validation.message);
      return;
    }
    
    // Store current file
    currentFile = file;
    
    // Update target format options
    updateFormatOptions(validation.canConvertTo);
    
    // Create and show preview
    await createPreview(file);
    
    // Show preview container
    previewContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    
    // Show file info
    const fileInfoDiv = document.createElement('div');
    fileInfoDiv.innerHTML = `
      <div class="file-info">
        <strong>File name:</strong> ${file.name}<br>
        <strong>File size:</strong> ${formatFileSize(file.size)}<br>
        <strong>File type:</strong> ${validation.type.toUpperCase()}
      </div>
    `;
    
    previewElement.appendChild(fileInfoDiv);
    
  } catch (error) {
    showError(`Error processing file: ${error.message}`);
  }
}

// Update target format options based on file type
function updateFormatOptions(formats) {
  // Clear existing options
  targetFormatSelect.innerHTML = '';
  
  // Add new options
  formats.forEach(format => {
    const option = document.createElement('option');
    option.value = format;
    option.textContent = format.toUpperCase();
    targetFormatSelect.appendChild(option);
  });
}

// Create file preview
async function createPreview(file) {
  try {
    // Clear previous preview
    previewElement.innerHTML = '';
    
    let preview;
    
    // Create preview based on file type
    if (file.type.startsWith('image/')) {
      preview = await ImageConverter.createPreview(file);
    } else if (file.type.startsWith('video/')) {
      preview = await VideoConverter.createPreview(file);
    } else if (file.type === 'application/pdf') {
      preview = await PDFConverter.createPreview(file);
    } else {
      throw new Error('Unsupported file type for preview');
    }
    
    // Add preview to container
    previewElement.appendChild(preview);
    
  } catch (error) {
    showError(`Error creating preview: ${error.message}`);
  }
}

// Update conversion options when target format changes
function updateConversionOptions() {
  // Additional logic can be added here if needed
}

// Handle file conversion
async function handleConversion() {
  try {
    if (!currentFile) {
      showError('No file selected');
      return;
    }
    
    const targetFormat = targetFormatSelect.value;
    
    // Add progress indicator
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressContainer.appendChild(progressBar);
    previewContainer.appendChild(progressContainer);
    
    // Progress callback
    const updateProgress = (percent) => {
      progressBar.style.width = `${percent}%`;
    };
    
    // Start conversion
    updateProgress(10);
    
    // Convert based on file type and target format
    if (currentFile.type.startsWith('image/')) {
      convertedFile = await ImageConverter.convert(currentFile, targetFormat);
      updateProgress(100);
    } else if (currentFile.type.startsWith('video/') && targetFormat === 'gif') {
      convertedFile = await VideoConverter.mp4ToGif(currentFile, updateProgress);
      updateProgress(100);
    } else if (currentFile.type === 'application/pdf' && targetFormat === 'jpg') {
      convertedFile = await PDFConverter.firstPageToJpg(currentFile);
      updateProgress(100);
    } else {
      throw new Error('Unsupported conversion');
    }
    
    // Show result
    displayResult(convertedFile);
    
    // Remove progress indicator
    previewContainer.removeChild(progressContainer);
    
    // Trigger conversion complete event for ad logic
    window.dispatchEvent(new CustomEvent('conversionComplete', {
      detail: { sourceFormat: currentFile.type, targetFormat }
    }));
    
  } catch (error) {
    showError(`Conversion error: ${error.message}`);
  }
}

// Display conversion result
async function displayResult(file) {
  // Clear previous result
  resultElement.innerHTML = '';
  
  // Create preview of converted file
  let preview;
  
  if (file.type.startsWith('image/')) {
    preview = await ImageConverter.createPreview(file);
  } else {
    // For other types, create a simple view
    preview = document.createElement('div');
    preview.innerHTML = `
      <div class="file-success">
        <span class="icon">✓</span>
        <div>Conversion successful!</div>
      </div>
    `;
  }
  
  // Add file info
  const fileInfoDiv = document.createElement('div');
  fileInfoDiv.innerHTML = `
    <div class="file-info">
      <strong>File name:</strong> ${file.name}<br>
      <strong>File size:</strong> ${formatFileSize(file.size)}<br>
      <strong>File type:</strong> ${file.type.split('/')[1].toUpperCase()}
    </div>
  `;
  
  // Add to result container
  resultElement.appendChild(preview);
  resultElement.appendChild(fileInfoDiv);
  
  // Show result container
  resultContainer.classList.remove('hidden');
}

// Handle download of converted file
function handleDownload() {
  if (convertedFile) {
    // Create download link
    const url = URL.createObjectURL(convertedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = convertedFile.name;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  // Add to document
  document.querySelector('.container').appendChild(errorDiv);
  
  // Remove after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init); 