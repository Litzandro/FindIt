import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import { Inter_900Black } from '@expo-google-fonts/inter/900Black';
import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PublicacionesProvider } from '@/features/objetos/publicaciones';
import { AuthProvider } from '@/features/auth/auth-context';
import { tema } from '@/features/inicio/ui/tema-findit';

// Mantener la pantalla de inicio nativa visible hasta disponer de Inter.
// En web se conserva el HTML renderizado por Expo Router.
if (Platform.OS !== 'web') {
  void SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const [fuentesListas, errorFuentes] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    if (Platform.OS !== 'web' && (fuentesListas || errorFuentes)) {
      void SplashScreen.hideAsync();
    }
  }, [fuentesListas, errorFuentes]);

  if (Platform.OS !== 'web' && !fuentesListas && !errorFuentes) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PublicacionesProvider>
          <StatusBar barStyle="dark-content" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: tema.fondo } }} />
        </PublicacionesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
