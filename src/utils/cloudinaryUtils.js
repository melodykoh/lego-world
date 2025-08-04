import CryptoJS from 'crypto-js';

// Update sync status in UI
const updateSyncStatus = (status, message) => {
  const element = document.getElementById('sync-status');
  if (element) {
    element.className = `sync-status-notice ${status}`;
    element.innerHTML = `<p>${message}</p>`;
  }
};

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
  
  // Add metadata as tags and public_id for cross-device access
  if (metadata.creationId) {
    formData.append('tags', `creation-${metadata.creationId}`);
  }
  
  // Encode creation name in public_id for easy retrieval
  if (metadata.creationName && metadata.creationId) {
    const safeName = metadata.creationName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const publicId = `lego-creations/${metadata.creationId}/${safeName}-${Date.now()}`;
    formData.append('public_id', publicId);
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

// Get cached creations
const getCachedCreations = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(CREATIONS_CACHE_KEY) || '[]');
    console.log('Using cached creations:', cached.length);
    return cached.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  } catch (error) {
    console.error('Error reading cached creations:', error);
    return [];
  }
};

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

// Create proper HMAC-SHA1 signature for Cloudinary
const generateSignature = (params, apiSecret) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return CryptoJS.HmacSHA1(sortedParams, apiSecret).toString();
};

// Fetch creations - try Cloudinary API first, fallback to cache
export const fetchCreationsFromCloudinary = async () => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.warn('Cloud name missing, using cached data');
    return getCachedCreations();
  }

  console.log('🔍 Checking for creations...');

  try {
    console.log('🔍 Trying serverless API endpoint...');
    
    // Try our serverless function first (most reliable)
    let response = await fetch('/api/cloudinary-search', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    console.log('Serverless API response:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Got data from serverless API:', data.creations?.length || 0, 'creations');
      
      // Update UI status
      updateSyncStatus('synced', '🌐 Cross-device sync active! Creations sync across all your devices.');
      
      return data.creations || [];
    }

    // Fallback to direct Cloudinary API
    console.log('Serverless API failed, trying direct Cloudinary API...');
    
    const listUrl = `https://res.cloudinary.com/${cloudName}/image/list/lego-creations.json`;
    response = await fetch(listUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('Direct Cloudinary API response:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Got data from direct Cloudinary API:', data.resources?.length || 0, 'images');
      
      // Parse creation data from public_id structure  
      const creationsMap = new Map();
      
      for (const photo of data.resources || []) {
        const publicIdParts = photo.public_id.split('/');
        if (publicIdParts.length >= 3) {
          const creationId = publicIdParts[1];
          const nameTimestamp = publicIdParts[2];
          const nameParts = nameTimestamp.split('-');
          const creationName = nameParts.slice(0, -1).join('-').replace(/-/g, ' ');
          
          if (!creationsMap.has(creationId)) {
            creationsMap.set(creationId, {
              id: creationId,
              name: creationName || 'Untitled Creation',
              dateAdded: new Date(photo.created_at || Date.now()).toISOString(),
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
      }
      
      const creations = Array.from(creationsMap.values())
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        
      console.log('✅ CROSS-DEVICE SYNC WORKING! Processed', creations.length, 'creations');
      updateSyncStatus('synced', '🌐 Cross-device sync active! Creations sync across all your devices.');
      
      return creations;
    }
    
    // Both APIs failed, use cache
    console.warn('❌ All APIs failed - using local cache');
    updateSyncStatus('local-only', '📱 Local-only mode: Creations are stored on this device only.');
    return getCachedCreations();
      
  } catch (error) {
    console.error('❌ Error fetching from Cloudinary API:', error.message);
    console.log('📱 LOCAL-ONLY MODE: Creations will only be visible on this device');
    
    // Update UI status
    updateSyncStatus('local-only', '📱 Local-only mode: Creations are stored on this device only. Cross-device sync unavailable.');
    
    return getCachedCreations();
  }
};