import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PublicacionesProvider } from '@/features/objetos/publicaciones';

// La navegacion de FindIt sustituye a las pestañas de demostracion de Expo.
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PublicacionesProvider>
        <StatusBar barStyle="dark-content" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F4F7F6' } }} />
      </PublicacionesProvider>
    </SafeAreaProvider>
  );
}
