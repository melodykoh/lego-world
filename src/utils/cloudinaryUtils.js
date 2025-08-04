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

// Simplified approach: Use cached data with cloud storage for images
export const fetchCreationsFromCloudinary = async () => {
  console.log('🔍 Loading creations...');
  
  // Get cached creations (this includes metadata for all uploaded creations)
  const cachedCreations = getCachedCreations();
  
  if (cachedCreations.length > 0) {
    console.log('✅ Found', cachedCreations.length, 'cached creations');
    // Images are already stored in Cloudinary with persistent URLs
    updateSyncStatus('synced', '☁️ Images stored in cloud, metadata synced when you upload from this device.');
    return cachedCreations;
  }
  
  console.log('📱 No cached creations found');
  updateSyncStatus('local-only', '📱 Upload your first creation to get started!');
  return [];
};