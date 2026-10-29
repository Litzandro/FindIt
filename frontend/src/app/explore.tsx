import { Redirect } from 'expo-router';

// Conserva enlaces antiguos sin mostrar la pantalla de ejemplo de Expo.
export default function ExploreScreen() {
  return <Redirect href="/" />;
}
