import { Text } from '@/components/ui/inter-text';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormularioCuenta } from './FormularioCuenta';
import { useCuenta } from '@/features/auth/use-cuenta';
import { tema, tipografia } from '@/features/inicio/ui/tema-findit';

export default function CuentaMovil() {
  const cuenta = useCuenta();
  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView style={styles.expandir} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.cabecera}>
            <Pressable accessibilityRole="button" accessibilityLabel="Volver al inicio" onPress={() => router.replace('/')} style={styles.volver}><Text style={styles.volverTexto}>‹</Text></Pressable>
            <Text style={styles.marca}><Text style={styles.verde}>Find</Text><Text style={styles.naranja}>It</Text></Text>
            <View style={styles.espacio} />
          </View>
          <View style={styles.formulario}><FormularioCuenta cuenta={cuenta} /></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: tema.fondo },
  expandir: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 45, flexGrow: 1 },
  cabecera: { minHeight: 65, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  volver: { width: 44, height: 44, borderRadius: 24, borderWidth: 1, borderColor: tema.borde, backgroundColor: tema.panel, alignItems: 'center', justifyContent: 'center' },
  volverTexto: { fontSize: 28, color: tema.texto, lineHeight: 33 },
  marca: { fontSize: 23, fontWeight: '800', letterSpacing: -0.7, fontFamily: tipografia.enfasis },
  verde: { color: tema.verde }, naranja: { color: tema.terracota },
  espacio: { width: 44 },
  formulario: { paddingTop: 28, width: '100%', maxWidth: 460, alignSelf: 'center' },
});
