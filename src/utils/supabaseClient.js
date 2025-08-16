import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Supabase config:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'missing'
});

// Create a dummy client if environment variables are missing (for build time)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database schema setup
export const initializeDatabase = async () => {
  console.log('🔄 Initializing database...');
  
  // Create creations table if it doesn't exist
  const { error: creatorsError } = await supabase.rpc('create_creations_table');
  
  if (creatorsError && !creatorsError.message.includes('already exists')) {
    console.error('Error creating creations table:', creatorsError);
  } else {
    console.log('✅ Creations table ready');
  }
  
  // Create photos table if it doesn't exist
  const { error: photosError } = await supabase.rpc('create_photos_table');
  
  if (photosError && !photosError.message.includes('already exists')) {
    console.error('Error creating photos table:', photosError);
  } else {
    console.log('✅ Photos table ready');
  }
};

// Store creation in database
export const saveCreationToDatabase = async (creation) => {
  if (!supabase) {
    console.error('Supabase client not initialized');
    throw new Error('Database not available');
  }
  
  try {
    // Get authenticated user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Insert creation record
    const { data: creationData, error: creationError } = await supabase
      .from('creations')
      .insert([{
        id: creation.id,
        name: creation.name,
        date_added: creation.dateAdded,
        user_id: user.id
      }])
      .select()
      .single();

    if (creationError) {
      console.error('Error saving creation:', creationError);
      throw creationError;
    }

    // Insert photo records
    const photoInserts = creation.photos.map(photo => ({
      creation_id: creation.id,
      url: photo.url,
      public_id: photo.publicId,
      name: photo.name,
      width: photo.width,
      height: photo.height,
      media_type: photo.mediaType || 'image'
    }));

    const { error: photosError } = await supabase
      .from('photos')
      .insert(photoInserts);

    if (photosError) {
      console.error('Error saving photos:', photosError);
      throw photosError;
    }

    console.log('✅ Creation saved to database:', creation.name);
    return creationData;
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
};

// Fetch all creations from database
export const fetchCreationsFromDatabase = async () => {
  if (!supabase) {
    console.error('Supabase client not initialized');
    throw new Error('Database not available');
  }
  
  try {
    console.log('🔍 Fetching creations from database...');
    
    // Fetch creations with their photos
    const { data: creations, error } = await supabase
      .from('creations')
      .select(`
        id,
        name,
        date_added,
        photos (
          url,
          public_id,
          name,
          width,
          height,
          media_type
        )
      `)
      .order('date_added', { ascending: false });

    if (error) {
      console.error('Error fetching creations:', error);
      throw error;
    }

    // Transform data to match our app format
    const transformedCreations = creations.map(creation => ({
      id: creation.id,
      name: creation.name,
      dateAdded: creation.date_added,
      photos: creation.photos.map(photo => ({
        url: photo.url,
        publicId: photo.public_id,
        name: photo.name,
        width: photo.width,
        height: photo.height,
        mediaType: photo.media_type || 'image'
      }))
    }));

    console.log('✅ Fetched', transformedCreations.length, 'creations from database');
    return transformedCreations;
  } catch (error) {
    console.error('Error fetching from database:', error);
    throw error;
  }
};

// Update creation name in database
export const updateCreationName = async (creationId, newName) => {
  if (!supabase) {
    console.error('Supabase client not initialized');
    throw new Error('Database not available');
  }
  
  try {
    console.log('🔄 Updating creation name:', { creationId, newName });
    
    const { data, error } = await supabase
      .from('creations')
      .update({ name: newName })
      .eq('id', creationId)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error updating creation name:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    console.log('✅ Updated creation name to:', newName);
    console.log('✅ Updated data:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating creation:', error);
    throw error;
  }
};

// Delete creation from database
export const deleteCreationFromDatabase = async (creationId) => {
  if (!supabase) {
    console.error('Supabase client not initialized');
    throw new Error('Database not available');
  }
  
  try {
    // Photos will be automatically deleted due to CASCADE
    const { error } = await supabase
      .from('creations')
      .delete()
      .eq('id', creationId);

    if (error) {
      console.error('Error deleting creation:', error);
      throw error;
    }

    console.log('✅ Deleted creation:', creationId);
  } catch (error) {
    console.error('Error deleting creation:', error);
    throw error;
  }
};

// Add media to existing creation
export const addMediaToCreation = async (creationId, mediaArray) => {
  if (!supabase) {
    console.error('Supabase client not initialized');
    throw new Error('Database not available');
  }
  
  try {
    console.log('🔄 Adding media to creation:', { creationId, mediaCount: mediaArray.length });
    
    // Insert new media records
    const mediaInserts = mediaArray.map(media => ({
      creation_id: creationId,
      url: media.url,
      public_id: media.publicId,
      name: media.name,
      width: media.width,
      height: media.height,
      media_type: media.mediaType || 'image'
    }));

    const { data, error } = await supabase
      .from('photos')
      .insert(mediaInserts)
      .select();

    if (error) {
      console.error('Error adding media to creation:', error);
      throw error;
    }

    console.log('✅ Added', mediaArray.length, 'media files to creation:', creationId);
    return data;
  } catch (error) {
    console.error('Error adding media to creation:', error);
    throw error;
  }
};

// Delete individual media from creation
export const deleteMediaFromCreation = async (creationId, mediaUrl) => {
  if (!supabase) {
    console.error('Supabase client not initialized');
    throw new Error('Database not available');
  }
  
  try {
    console.log('🔄 Deleting media from creation:', { creationId, mediaUrl });
    
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('creation_id', creationId)
      .eq('url', mediaUrl);

    if (error) {
      console.error('Error deleting media from creation:', error);
      throw error;
    }

    console.log('✅ Deleted media from creation:', creationId);
  } catch (error) {
    console.error('Error deleting media from creation:', error);
    throw error;
  }
};