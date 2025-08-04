// Vercel serverless function to proxy Cloudinary API calls
import crypto from 'crypto';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.REACT_APP_CLOUDINARY_API_KEY;
  const apiSecret = process.env.REACT_APP_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    res.status(500).json({ error: 'Cloudinary credentials not configured' });
    return;
  }

  try {
    // Try the simpler list API first (if enabled)
    let response = await fetch(
      `https://res.cloudinary.com/${cloudName}/image/list/lego-creations.json`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    let data;
    
    if (response.ok) {
      // Use list API response
      data = await response.json();
      console.log('✅ Using list API, found:', data.resources?.length || 0, 'images');
    } else {
      // Fallback to authenticated Search API
      console.log('📋 List API failed, trying Search API...');
      
      const timestamp = Math.round(Date.now() / 1000);
      const params = {
        expression: 'folder:lego-creations',
        with_field: 'context,tags',
        max_results: 100,
        sort_by: 'created_at',
        timestamp: timestamp.toString()
      };

      // Create signature
      const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');

      const signature = crypto
        .createHmac('sha1', apiSecret)
        .update(sortedParams)
        .digest('hex');

      // Create form data
      const formData = new URLSearchParams();
      Object.keys(params).forEach(key => {
        formData.append(key, params[key]);
      });
      formData.append('api_key', apiKey);
      formData.append('signature', signature);

      // Call Cloudinary Search API
      response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary Search API error:', response.status, errorText);
        res.status(response.status).json({ 
          error: 'Cloudinary API error', 
          status: response.status,
          details: errorText 
        });
        return;
      }
      
      data = await response.json();
    }

    // Process the data to match our expected format
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

    const creations = Array.from(creationsMap.values())
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

    res.status(200).json({ creations });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}