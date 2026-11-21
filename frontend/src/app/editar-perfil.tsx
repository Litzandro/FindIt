import { Text, TextInput } from '@/components/ui/inter-text';
import MarcaFindIt from '@/components/marca-findit';
import { useCuenta } from '@/features/auth/use-cuenta';
import { tema } from '@/features/inicio/ui/tema-findit';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkeletonPerfil } from '@/components/ui/skeleton';

export default function EditarPerfil() {
  const cuenta = useCuenta();
  useEffect(() => {
    if (!cuenta.cargando && !cuenta.usuario) router.replace('/cuenta');
  }, [cuenta.cargando, cuenta.usuario]);

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.contenido}>
            <View style={styles.cabecera}>
              <Pressable accessibilityRole="button" onPress={() => router.replace('/cuenta')} style={styles.volver}>
                <Text style={styles.volverTexto}>‹</Text>
              </Pressable>
              <Text accessibilityRole="header" style={styles.titulo}>Editar perfil</Text>
              <MarcaFindIt ancho={99} />
            </View>
            {cuenta.cargando || cuenta.cargandoPerfil ? <SkeletonPerfil /> : <>
              <View style={styles.avatar}><Text style={styles.avatarTexto}>{(cuenta.nombrePerfil || 'F').trim().charAt(0).toUpperCase()}</Text></View>
              {cuenta.errorConfiguracion && <Text style={styles.error}>{cuenta.errorConfiguracion}</Text>}
              {!!cuenta.errorPerfil && <Text style={styles.error}>{cuenta.errorPerfil}</Text>}
              {!!cuenta.error && <Text style={styles.error}>{cuenta.error}</Text>}
              {!!cuenta.exito && <Text style={styles.exito}>{cuenta.exito}</Text>}
              <View style={styles.formulario}>
                <Text style={styles.etiqueta}>Nombre completo</Text>
                <TextInput style={styles.entrada} accessibilityLabel="Nombre completo" value={cuenta.nombrePerfil} onChangeText={cuenta.setNombrePerfil} placeholder="Tu nombre" autoCapitalize="words" maxLength={80} />
                <Text style={styles.etiqueta}>Correo electrónico</Text>
                <View style={[styles.entrada, styles.soloLectura]}><Text style={styles.correo}>{cuenta.usuario?.email ?? ''}</Text></View>
                <Text style={styles.ayuda}>Puedes cambiar tu nombre. La edición del correo electrónico, teléfono y comunidad estará disponible en futuras versiones.</Text>
                <Pressable accessibilityRole="button" style={styles.boton} onPress={() => void cuenta.guardarNombre()} disabled={cuenta.procesando || !!cuenta.errorConfiguracion}>
                  <Text style={styles.botonTexto}>{cuenta.procesando ? 'Guardando…' : 'Guardar cambios'}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" style={styles.cancelar} onPress={() => router.replace('/cuenta')}>
                  <Text style={styles.cancelarTexto}>Cancelar</Text>
                </Pressable>
              </View>
            </>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: tema.fondo }, flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 40 },
  contenido: { maxWidth: 570, width: '100%', alignSelf: 'center', gap: 18 },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'space-between', minHeight: 68 },
  volver: { width: 44, height: 44, borderRadius: 23, borderWidth: 1, borderColor: tema.borde, alignItems: 'center', justifyContent: 'center', backgroundColor: tema.panel },
  volverTexto: { color: tema.texto, fontSize: 29, lineHeight: 32 },
  titulo: { color: tema.texto, fontWeight: '800', fontSize: 24, flex: 1 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: tema.verde, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  avatarTexto: { color: tema.panel, fontSize: 36, fontWeight: '800' },
  formulario: { gap: 10, marginTop: 5 },
  etiqueta: { color: tema.texto, fontSize: 14, fontWeight: '700', marginTop: 8 },
  entrada: { minHeight: 50, borderWidth: 1, borderColor: tema.borde, borderRadius: 12, backgroundColor: tema.panel, paddingHorizontal: 14, justifyContent: 'center', color: tema.texto, fontSize: 15 },
  soloLectura: { backgroundColor: '#F2F0EA' }, correo: { color: tema.secundario, fontSize: 14 },
  ayuda: { color: tema.secundario, fontSize: 12, lineHeight: 19, marginTop: 8, marginBottom: 16 },
  boton: { minHeight: 52, backgroundColor: tema.verde, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  botonTexto: { color: tema.panel, fontWeight: '800', fontSize: 14 },
  cancelar: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 20 }, cancelarTexto: { color: tema.texto, fontWeight: '700' },
  error: { padding: 12, borderRadius: 10, backgroundColor: '#FCEDEA', color: tema.error, fontSize: 13 },
  exito: { padding: 12, borderRadius: 10, backgroundColor: tema.verdeClaro, color: tema.verdeOscuro, fontSize: 13 },
});
