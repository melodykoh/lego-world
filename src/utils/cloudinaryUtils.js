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

// Store creation metadata locally as backup
const CREATIONS_CACHE_KEY = 'cloudinary-creations-cache';

// Cache creation data when uploading
export const cacheCreationMetadata = (creationData) => {
  try {
    const cached = JSON.parse(localStorage.getItem(CREATIONS_CACHE_KEY) || '[]');
    const existingIndex = cached.findIndex(c => c.id === creationData.id);
    
    if (existingIndex >= 0) {
      cached[existingIndex] = creationData;
    } else {
      cached.push(creationData);
    }
    
    localStorage.setItem(CREATIONS_CACHE_KEY, JSON.stringify(cached));
    console.log('✅ Cached creation metadata:', creationData);
    console.log('📦 Total cached creations:', cached.length);
  } catch (error) {
    console.error('Error caching creation metadata:', error);
  }
};

// Fetch all creations from Cloudinary (with fallback to cache)
export const fetchCreationsFromCloudinary = async () => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    throw new Error('Cloudinary cloud name missing');
  }

  try {
    // Try multiple Cloudinary APIs
    const urls = [
      `https://res.cloudinary.com/${cloudName}/image/list/lego-creations.json`,
      `https://res.cloudinary.com/${cloudName}/image/search/folder:lego-creations.json`,
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`
    ];
    
    let response = null;
    let workingUrl = null;
    
    for (const url of urls) {
      try {
        console.log('Trying Cloudinary API:', url);
        response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (response.ok) {
          workingUrl = url;
          break;
        }
      } catch (err) {
        console.log('Failed to fetch from:', url, err.message);
        continue;
      }
    }
    
    if (response && response.ok) {
      console.log('Successfully fetched from:', workingUrl);
      const data = await response.json();
      console.log('Cloudinary data received:', data);
      
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
      const creations = Array.from(creationsMap.values())
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        
      console.log('Processed creations from Cloudinary:', creations);
      return creations;
    }
    
    // Fallback to cached metadata
    console.warn('Cloudinary list API not available, using cached metadata');
    const cached = JSON.parse(localStorage.getItem(CREATIONS_CACHE_KEY) || '[]');
    return cached.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      
  } catch (error) {
    console.error('Error fetching creations from Cloudinary:', error);
    
    // Fallback to cached metadata
    try {
      const cached = JSON.parse(localStorage.getItem(CREATIONS_CACHE_KEY) || '[]');
      console.log('Using cached creations as fallback:', cached);
      return cached.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    } catch (cacheError) {
      console.error('Error reading cached creations:', cacheError);
      return [];
    }
  }
};