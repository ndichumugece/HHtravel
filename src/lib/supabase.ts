import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: string) => {
    try {
        return Boolean(new URL(url));
    } catch (e) {
        return false;
    }
};

const isConfigured = supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'your_project_url' &&
    supabaseAnonKey !== 'your_anon_key' &&
    isValidUrl(supabaseUrl);

if (!isConfigured) {
    console.warn('Supabase is not configured. Creating a dummy client for pure UI rendering.');
}

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder');

export const isSupabaseConfigured = isConfigured;
