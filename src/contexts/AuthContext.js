import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

// Check if Supabase client is available
const isSupabaseConfigured = !!supabase;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, auth disabled');
      setLoading(false);
      return;
    }

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signInWithEmail = async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication not configured');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }
    
    return data;
  };

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication not configured');
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign up error:', error);
      throw error;
    }
    
    return data;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, cannot sign out');
      return;
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Check if current user is the admin (replace with your email)
  const ADMIN_EMAIL = 'your-email@example.com'; // Temporarily set to default for initial setup
  const isAdmin = user?.email === ADMIN_EMAIL;

  const value = {
    user,
    loading,
    signInWithEmail,
    signUp,
    signOut,
    isAuthenticated: !!user,
    isAdmin,
    ADMIN_EMAIL,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};