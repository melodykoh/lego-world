// Utility functions for video handling and thumbnail generation

/**
 * Generates a Cloudinary video thumbnail URL from a video URL
 * @param {string} videoUrl - The original video URL
 * @param {Object} options - Thumbnail options
 * @param {number} options.width - Thumbnail width (default: 300)
 * @param {number} options.height - Thumbnail height (default: 200)
 * @param {string} options.format - Output format (default: 'jpg')
 * @returns {string} - Thumbnail image URL
 */
export const generateVideoThumbnail = (videoUrl, options = {}) => {
  const { width = 300, height = 200, format = 'jpg' } = options;
  
  // Check if it's a Cloudinary video URL
  if (!videoUrl || !videoUrl.includes('cloudinary.com')) {
    return null;
  }
  
  try {
    // Convert video URL to thumbnail URL
    // From: https://res.cloudinary.com/cloud/video/upload/v123/folder/file.mp4
    // To:   https://res.cloudinary.com/cloud/video/upload/c_thumb,w_300,h_200/v123/folder/file.jpg
    
    const url = new URL(videoUrl);
    const pathParts = url.pathname.split('/');
    
    // Find the upload index
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) {
      return null;
    }
    
    // Extract file path and remove extension
    const filePathIndex = uploadIndex + 1;
    const filePath = pathParts.slice(filePathIndex).join('/');
    const filePathWithoutExt = filePath.replace(/\.[^/.]+$/, '');
    
    // Construct thumbnail transformation
    const transformation = `c_thumb,w_${width},h_${height}`;
    
    // Build new URL
    const baseUrl = `${url.protocol}//${url.host}`;
    const newPath = [
      ...pathParts.slice(0, uploadIndex + 1),
      transformation,
      filePathWithoutExt + '.' + format
    ].join('/');
    
    return baseUrl + newPath;
  } catch (error) {
    console.error('Error generating video thumbnail:', error);
    return null;
  }
};

/**
 * Checks if a URL is a video based on media type or file extension
 * @param {string} url - The media URL
 * @param {string} mediaType - The media type ('video' or 'image')
 * @returns {boolean} - True if it's a video
 */
export const isVideo = (url, mediaType) => {
  if (mediaType === 'video') {
    return true;
  }
  
  if (!url) {
    return false;
  }
  
  // Check file extension as fallback
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.m4v'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

/**
 * Gets the appropriate thumbnail URL for media
 * @param {Object} media - Media object with url and mediaType
 * @param {Object} options - Thumbnail options
 * @returns {string} - Thumbnail URL (original for images, generated for videos)
 */
export const getMediaThumbnail = (media, options = {}) => {
  if (!media || !media.url) {
    return null;
  }
  
  if (isVideo(media.url, media.mediaType)) {
    return generateVideoThumbnail(media.url, options);
  }
  
  return media.url; // Return original URL for images
};