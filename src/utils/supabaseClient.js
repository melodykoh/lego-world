import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  try {
    // Insert creation record
    const { data: creationData, error: creationError } = await supabase
      .from('creations')
      .insert([{
        id: creation.id,
        name: creation.name,
        date_added: creation.dateAdded
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
      height: photo.height
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
          height
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
        height: photo.height
      }))
    }));

    console.log('✅ Fetched', transformedCreations.length, 'creations from database');
    return transformedCreations;
  } catch (error) {
    console.error('Error fetching from database:', error);
    throw error;
  }
};