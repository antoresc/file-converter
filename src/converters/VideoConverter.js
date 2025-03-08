/**
 * Handles video format conversions using FFmpeg.wasm
 */
export class VideoConverter {
  /**
   * Converts MP4 video to GIF
   * @param {File} file - The source MP4 file
   * @param {Function} progressCallback - Optional callback for progress updates
   * @returns {Promise<File>} - Promise resolving to the converted GIF file
   */
  static async mp4ToGif(file, progressCallback = null) {
    // Check if the file is an MP4 video
    if (!file.type.includes('mp4') && !file.type.includes('video')) {
      throw new Error('The provided file is not an MP4 video');
    }
    
    try {
      // Load FFmpeg
      const { createFFmpeg, fetchFile } = window.FFmpeg;
      const ffmpeg = createFFmpeg({ 
        log: true,
        progress: ({ ratio }) => {
          if (progressCallback) {
            progressCallback(Math.round(ratio * 100));
          }
        }
      });
      
      await ffmpeg.load();
      
      // Write the input file to FFmpeg's virtual file system
      const inputFileName = 'input.mp4';
      ffmpeg.FS('writeFile', inputFileName, await fetchFile(file));
      
      // Run the FFmpeg command to convert MP4 to GIF (max 5 seconds)
      await ffmpeg.run(
        '-i', inputFileName,
        '-t', '5',
        '-vf', 'fps=10,scale=320:-1:flags=lanczos', // Optimize GIF settings
        'output.gif'
      );
      
      // Read the output file from FFmpeg's virtual file system
      const data = ffmpeg.FS('readFile', 'output.gif');
      
      // Clean up resources
      ffmpeg.FS('unlink', inputFileName);
      ffmpeg.FS('unlink', 'output.gif');
      
      // Create a new file from the output data
      const fileName = file.name.split('.')[0];
      const gifFile = new File([data.buffer], `${fileName}.gif`, { type: 'image/gif' });
      
      return gifFile;
    } catch (error) {
      console.error('Error in mp4ToGif:', error);
      throw new Error(`Failed to convert video to GIF: ${error.message}`);
    }
  }
  
  /**
   * Creates a preview of the video
   * @param {File} file - The video file to preview
   * @returns {Promise<HTMLVideoElement>} - Promise resolving to the video element
   */
  static createPreview(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.controls = true;
      video.muted = true;
      video.width = 320;
      
      video.onloadedmetadata = () => {
        // Limit preview to 5 seconds
        if (video.duration > 5) {
          video.dataset.fullDuration = video.duration;
          const warningMsg = document.createElement('div');
          warningMsg.textContent = 'Note: Only the first 5 seconds will be converted to GIF';
          warningMsg.style.color = 'orange';
          warningMsg.style.marginTop = '5px';
          warningMsg.style.fontSize = '14px';
          const container = document.createElement('div');
          container.appendChild(video);
          container.appendChild(warningMsg);
          resolve(container);
        } else {
          resolve(video);
        }
      };
      
      video.onerror = () => {
        reject(new Error('Failed to create video preview'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  }
} 