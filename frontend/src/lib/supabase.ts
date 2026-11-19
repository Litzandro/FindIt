import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | undefined;

/**
 * Cliente único de Supabase. Se crea al necesitarlo para que la aplicación
 * actual pueda abrirse incluso antes de configurar el archivo .env.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!url || !publishableKey) {
    throw new Error(
      'Faltan EXPO_PUBLIC_SUPABASE_URL y/o EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY en frontend/.env',
    );
  }

  if (!client) {
    client = createClient(url, publishableKey, {
      auth: {
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

    // En Android/iOS el refresco del token depende de si la app está activa.
    if (Platform.OS !== 'web') {
      AppState.addEventListener('change', (state) => {
        if (state === 'active') client?.auth.startAutoRefresh();
        else client?.auth.stopAutoRefresh();
      });
    }
  }

  return client;
}
