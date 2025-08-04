// Cloudinary upload utility
export const uploadToCloudinary = async (file, metadata = {}) => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'lego-creations');
  
  // Add metadata as tags and context
  if (metadata.creationId) {
    formData.append('tags', `creation-${metadata.creationId}`);
  }
  
  if (metadata.creationName || metadata.dateAdded) {
    const context = {};
    if (metadata.creationName) context.creationName = metadata.creationName;
    if (metadata.dateAdded) context.dateAdded = metadata.dateAdded;
    formData.append('context', JSON.stringify(context));
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Generate optimized image URLs
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const {
    width = 'auto',
    height = 'auto',
    quality = 'auto',
    format = 'auto',
  } = options;

  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},q_${quality},f_${format}/${publicId}`;
};

// Fetch all creations from Cloudinary
export const fetchCreationsFromCloudinary = async () => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    throw new Error('Cloudinary cloud name missing');
  }

  try {
    // Use Cloudinary's search API
    const response = await fetch(
      `https://res.cloudinary.com/${cloudName}/image/list/lego-creations.json`
    );

    if (!response.ok) {
      console.warn('Cloudinary search not available, using empty state');
      return [];
    }

    const data = await response.json();
    
    // Group photos by creation using tags
    const creationsMap = new Map();
    
    for (const photo of data.resources || []) {
      // Find creation ID from tags
      const creationTag = photo.tags?.find(tag => tag.startsWith('creation-'));
      if (!creationTag) continue;
      
      const creationId = creationTag.replace('creation-', '');
      const context = photo.context || {};
      
      if (!creationsMap.has(creationId)) {
        creationsMap.set(creationId, {
          id: creationId,
          name: context.creationName || 'Untitled Creation',
          dateAdded: context.dateAdded || new Date().toISOString(),
          photos: []
        });
      }
      
      const creation = creationsMap.get(creationId);
      creation.photos.push({
        url: photo.secure_url,
        publicId: photo.public_id,
        name: photo.original_filename || 'photo',
        width: photo.width,
        height: photo.height
      });
    }
    
    // Convert map to array and sort by date
    return Array.from(creationsMap.values())
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      
  } catch (error) {
    console.error('Error fetching creations from Cloudinary:', error);
    return [];
  }
};