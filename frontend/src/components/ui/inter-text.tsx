import {
  Text as NativeText,
  TextInput as NativeTextInput,
  StyleSheet,
  type TextProps,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

/**
 * Textos de FindIt: todas las variantes mantienen la familia Inter.
 * Escoger el archivo del peso explícitamente evita diferencias entre
 * Android, iOS y web con las fuentes estáticas de Expo SDK 57.
 */
function fuenteInter(style: TextProps['style'] | TextInputProps['style']): string {
  const peso = StyleSheet.flatten(style)?.fontWeight;
  const numero = peso === 'bold' ? 700 : peso === 'normal' || peso == null ? 400 : Number(peso);

  if (numero >= 900) return 'Inter_900Black';
  if (numero >= 800) return 'Inter_800ExtraBold';
  if (numero >= 700) return 'Inter_700Bold';
  if (numero >= 600) return 'Inter_600SemiBold';
  if (numero >= 500) return 'Inter_500Medium';
  return 'Inter_400Regular';
}

function estiloInter(style: TextProps['style'] | TextInputProps['style']): TextStyle {
  return { fontFamily: fuenteInter(style), fontWeight: 'normal' };
}

export function Text({ style, ...rest }: TextProps) {
  return <NativeText {...rest} style={[style, estiloInter(style)]} />;
}

export function TextInput({ style, ...rest }: TextInputProps) {
  return <NativeTextInput {...rest} style={[style, estiloInter(style)]} />;
}
