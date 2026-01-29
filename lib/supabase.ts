import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl: string = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabasePublishableKey: string =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// A simple no-op storage adapter for the server.
// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
const noOpStorage = {
  setItem: async (key: string, value: string): Promise<void> => {},
  getItem: async (key: string): Promise<string | null> => {
    return null;
  },
  removeItem: async (key: string): Promise<void> => {},
};

const isServer = typeof window === 'undefined';

// Let Supabase use its default localStorage on the web.
// For native, use AsyncStorage.
// For server, use the no-op storage.
const storage = isServer
  ? noOpStorage
  : Platform.OS === 'web'
    ? undefined // Supabase will use localStorage by default.
    : AsyncStorage;

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage: storage,
      // Disable auth features on the server
      autoRefreshToken: !isServer,
      persistSession: !isServer,
      // Only detect session in URL on the web client
      detectSessionInUrl: !isServer && Platform.OS === 'web',
    },
  }
);
