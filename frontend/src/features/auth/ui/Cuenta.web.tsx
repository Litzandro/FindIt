import { Text } from '@/components/ui/inter-text';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormularioCuenta } from './FormularioCuenta';
import { useCuenta } from '@/features/auth/use-cuenta';
import { tema, tipografia } from '@/features/inicio/ui/tema-findit';

export default function CuentaWeb() {
  const cuenta = useCuenta();
  const { width } = useWindowDimensions();
  const dosColumnas = width >= 760;
  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView style={styles.flex}>
        <View style={[styles.distribucion, !dosColumnas && styles.distribucionCompacta]}>
          {dosColumnas && (
            <View style={styles.panelIzquierdo}>
              <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.volverMarca}>
                <Text style={styles.marcaBlanca}>Find<Text style={styles.marcaNaranja}>It</Text></Text>
              </Pressable>
              <View style={styles.panelLema}>
                <Text style={styles.lema}>{cuenta.usuario ? 'Cada objeto tiene una historia.' : cuenta.modo === 'registrar' ? 'Únete y ayuda a que cada objeto vuelva a casa.' : 'Entra y encuentra lo que se perdió.'}</Text>
              </View>
            </View>
          )}
          <ScrollView style={styles.panelDerecho} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
            {!dosColumnas && <Pressable accessibilityRole="button" onPress={() => router.replace('/')}><Text style={styles.marca}><Text style={{ color: tema.verde }}>Find</Text><Text style={{ color: tema.terracota }}>It</Text></Text></Pressable>}
            <View style={styles.formulario}><FormularioCuenta cuenta={cuenta} /></View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: tema.fondo },
  flex: { flex: 1 },
  distribucion: { flex: 1, flexDirection: 'row', minHeight: 700 },
  distribucionCompacta: { flexDirection: 'column' },
  panelIzquierdo: { flex: 0.42, backgroundColor: tema.verde, padding: 34, justifyContent: 'space-between', minWidth: 300 },
  volverMarca: { alignSelf: 'flex-start', paddingVertical: 8 },
  marcaBlanca: { color: tema.panel, fontWeight: '800', fontSize: 24, letterSpacing: -0.9, fontFamily: tipografia.enfasis },
  marcaNaranja: { color: '#F6B48F' },
  panelLema: { paddingBottom: 42, maxWidth: 470 },
  lema: { color: tema.panel, fontWeight: '800', fontSize: 35, lineHeight: 41, letterSpacing: -1.3, fontFamily: tipografia.enfasis },
  panelDerecho: { flex: 0.58 },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, paddingVertical: 52 },
  formulario: { maxWidth: 440, width: '100%' },
  marca: { fontWeight: '800', fontSize: 26, marginBottom: 25 },
});
