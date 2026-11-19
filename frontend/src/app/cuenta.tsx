import { useAuth } from '@/features/auth/auth-context';
import { getSupabaseClient } from '@/lib/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView,
    StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Modo = 'ingresar' | 'registrar';

function mensajeError(error: unknown): string {
  const mensaje = error instanceof Error ? error.message : String(error);
  if (/invalid login credentials/i.test(mensaje)) return 'El correo o la contraseña son incorrectos.';
  if (/email not confirmed/i.test(mensaje)) return 'Primero confirma tu correo electrónico.';
  if (/password should be at least|password is too short/i.test(mensaje)) return 'La contraseña no cumple con los requisitos del servidor.';
  if (/failed to fetch|network request failed/i.test(mensaje)) return 'Sin conexión con Supabase. Revisa Docker, la IP y el archivo .env.';
  return mensaje;
}

function Campo({ etiqueta, valor, cambiar, ...resto }: {
  etiqueta: string;
  valor: string;
  cambiar: (texto: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'new-password' | 'name' | 'off';
}) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        style={styles.entrada}
        value={valor}
        onChangeText={cambiar}
        placeholderTextColor="#71857E"
        {...resto}
      />
    </View>
  );
}

export default function CuentaScreen() {
  const { modo: modoSolicitado } = useLocalSearchParams<{ modo?: string }>();
  const { usuario, perfil, cargando, cargandoPerfil, errorConfiguracion, errorPerfil, recargarPerfil, cerrarSesion } = useAuth();
  const [modo, setModo] = useState<Modo>(modoSolicitado === 'registrar' ? 'registrar' : 'ingresar');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [nombrePerfil, setNombrePerfil] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    if (modoSolicitado === 'registrar' || modoSolicitado === 'ingresar') setModo(modoSolicitado);
  }, [modoSolicitado]);

  useEffect(() => {
    if (perfil) setNombrePerfil(perfil.display_name);
  }, [perfil]);

  function cambiarModo(nuevoModo: Modo) {
    setModo(nuevoModo);
    setErrorFormulario('');
    setExito('');
    setContrasena('');
    setConfirmacion('');
  }

  async function enviar() {
    if (procesando) return;
    setErrorFormulario('');
    setExito('');
    const email = correo.trim().toLowerCase();
    const nombreLimpio = nombre.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorFormulario('Escribe un correo electrónico válido.');
      return;
    }
    if (modo === 'registrar' && (nombreLimpio.length < 2 || nombreLimpio.length > 80)) {
      setErrorFormulario('Escribe un nombre de entre 2 y 80 caracteres.');
      return;
    }
    if (modo === 'registrar' && contrasena.length < 8) {
      setErrorFormulario('Usa una contraseña de al menos 8 caracteres.');
      return;
    }
    if (modo === 'registrar' && contrasena !== confirmacion) {
      setErrorFormulario('Las contraseñas no coinciden.');
      return;
    }
    if (modo === 'ingresar' && !contrasena) {
      setErrorFormulario('Escribe tu contraseña.');
      return;
    }

    setProcesando(true);
    try {
      const supabase = getSupabaseClient();
      if (modo === 'registrar') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: contrasena,
          options: { data: { display_name: nombreLimpio } },
        });
        if (error) throw error;
        setContrasena('');
        setConfirmacion('');
        setExito(data.session
          ? 'Cuenta creada. Ya tienes la sesión iniciada.'
          : 'Solicitud de registro recibida. Si corresponde, revisa tu correo para confirmar la cuenta.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: contrasena });
        if (error) throw error;
        setContrasena('');
        setExito('¡Sesión iniciada correctamente!');
      }
    } catch (error) {
      setErrorFormulario(mensajeError(error));
    } finally {
      setProcesando(false);
    }
  }

  async function guardarNombre() {
    if (!usuario || procesando) return;
    const nuevoNombre = nombrePerfil.trim();
    setErrorFormulario('');
    setExito('');
    if (nuevoNombre.length < 2 || nuevoNombre.length > 80) {
      setErrorFormulario('El nombre debe tener entre 2 y 80 caracteres.');
      return;
    }
    setProcesando(true);
    try {
      const { error } = await getSupabaseClient()
        .from('profiles')
        .update({ display_name: nuevoNombre })
        .eq('id', usuario.id)
        .select('id,display_name')
        .single();
      if (error) throw error;
      recargarPerfil();
      setExito('Nombre actualizado en Supabase.');
    } catch (error) {
      setErrorFormulario(mensajeError(error));
    } finally {
      setProcesando(false);
    }
  }

  async function salir() {
    if (procesando) return;
    setProcesando(true);
    setErrorFormulario('');
    setExito('');
    try {
      await cerrarSesion();
      setContrasena('');
      setConfirmacion('');
      setExito('Sesión cerrada.');
    } catch (error) {
      setErrorFormulario(mensajeError(error));
    } finally {
      setProcesando(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.contenido}>
          <Pressable accessibilityRole="button" onPress={() => router.dismissTo('/')} style={styles.volver}>
            <Text style={styles.enlace}>← Volver al inicio</Text>
          </Pressable>
          <Text accessibilityRole="header" style={styles.titulo}>{usuario ? 'Mi cuenta' : 'Bienvenido a FindIt'}</Text>
          <Text style={styles.descripcion}>
            {usuario ? 'Tu sesión se mantiene en este dispositivo.' : 'Crea una cuenta o entra para probar la autenticación de Supabase.'}
          </Text>

          {cargando ? (
            <View style={styles.tarjeta}>
              <ActivityIndicator color="#0D7F6B" />
              <Text style={styles.descripcion}>Revisando la sesión…</Text>
            </View>
          ) : errorConfiguracion ? (
            <View style={styles.tarjeta}>
              <Text style={styles.errorTitulo}>Configuración pendiente</Text>
              <Text selectable style={styles.error}>{errorConfiguracion}</Text>
              <Text style={styles.ayuda}>Revisa las variables EXPO_PUBLIC_ de frontend/.env y reinicia Expo.</Text>
            </View>
          ) : (
            <View style={styles.tarjeta}>
              {errorFormulario !== '' && <Text accessibilityRole="alert" style={styles.error}>{errorFormulario}</Text>}
              {exito !== '' && <Text accessibilityLiveRegion="polite" style={styles.exito}>{exito}</Text>}
              {usuario ? (
                <>
                  <Text style={styles.seccionTitulo}>Sesión activa</Text>
                  <Text selectable style={styles.descripcion}>Correo: {usuario.email ?? 'Sin correo'}</Text>
                  <Text style={styles.ayuda}>El perfil se guarda en la tabla public.profiles.</Text>
                  {cargandoPerfil ? <ActivityIndicator color="#0D7F6B" /> : errorPerfil ? (
                    <View style={styles.campo}>
                      <Text style={styles.error}>{errorPerfil}</Text>
                      <Pressable accessibilityRole="button" onPress={recargarPerfil}>
                        <Text style={styles.enlace}>Reintentar consulta</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <>
                      <Campo etiqueta="Nombre visible" valor={nombrePerfil} cambiar={setNombrePerfil} autoComplete="name" />
                      <Pressable accessibilityRole="button" onPress={guardarNombre} disabled={procesando} style={[styles.boton, procesando && styles.botonDeshabilitado]}>
                        <Text style={styles.botonTexto}>{procesando ? 'Guardando…' : 'Guardar nombre en Supabase'}</Text>
                      </Pressable>
                    </>
                  )}
                  <Pressable accessibilityRole="button" onPress={salir} disabled={procesando} style={[styles.botonContorno, procesando && styles.botonDeshabilitado]}>
                    <Text style={styles.botonContornoTexto}>Cerrar sesión</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <View style={styles.selector}>
                    <Pressable accessibilityRole="button" accessibilityState={{ selected: modo === 'ingresar' }} onPress={() => cambiarModo('ingresar')} style={[styles.pestana, modo === 'ingresar' && styles.pestanaActiva]}>
                      <Text style={[styles.pestanaTexto, modo === 'ingresar' && styles.pestanaTextoActiva]}>Iniciar sesión</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityState={{ selected: modo === 'registrar' }} onPress={() => cambiarModo('registrar')} style={[styles.pestana, modo === 'registrar' && styles.pestanaActiva]}>
                      <Text style={[styles.pestanaTexto, modo === 'registrar' && styles.pestanaTextoActiva]}>Registrarme</Text>
                    </Pressable>
                  </View>
                  {modo === 'registrar' && <Campo etiqueta="Nombre" valor={nombre} cambiar={setNombre} placeholder="Tu nombre" autoComplete="name" />}
                  <Campo etiqueta="Correo electrónico" valor={correo} cambiar={setCorreo} autoCapitalize="none" autoComplete="email" placeholder="nombre@ejemplo.com" />
                  <Campo etiqueta="Contraseña" valor={contrasena} cambiar={setContrasena} autoCapitalize="none" autoComplete={modo === 'registrar' ? 'new-password' : 'password'} secureTextEntry placeholder="Tu contraseña" />
                  {modo === 'registrar' && <>
                    <Campo etiqueta="Confirmar contraseña" valor={confirmacion} cambiar={setConfirmacion} autoCapitalize="none" autoComplete="new-password" secureTextEntry placeholder="Repite la contraseña" />
                    <Text style={styles.ayuda}>Mínimo 8 caracteres. Usa una contraseña única.</Text>
                  </>}
                  <Pressable accessibilityRole="button" disabled={procesando} onPress={() => void enviar()} style={[styles.boton, procesando && styles.botonDeshabilitado]}>
                    <Text style={styles.botonTexto}>{procesando ? 'Procesando…' : modo === 'registrar' ? 'Crear mi cuenta' : 'Entrar'}</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
          <View style={styles.aviso}>
            <Text style={styles.avisoTitulo}>Importante para esta etapa</Text>
            <Text style={styles.ayuda}>
              Registro, sesiones y nombre de usuario ya se gestionan con Supabase. Las publicaciones y fotografías aún son de prueba local; se conectarán después a posts y Storage.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F4F7F6' },
  flex: { flex: 1 },
  contenido: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 44, gap: 16, maxWidth: 580, width: '100%', alignSelf: 'center' },
  volver: { paddingVertical: 10, alignSelf: 'flex-start' },
  enlace: { color: '#0D7F6B', fontSize: 15, fontWeight: '700' },
  titulo: { fontSize: 30, fontWeight: '800', color: '#172825' },
  descripcion: { fontSize: 15, color: '#596C67', lineHeight: 22 },
  tarjeta: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#DBE5E1', padding: 24, gap: 17 },
  seccionTitulo: { fontSize: 18, fontWeight: '700', color: '#172825' },
  selector: { flexDirection: 'row', gap: 8 },
  pestana: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 10, backgroundColor: '#EFF4F2', alignItems: 'center' },
  pestanaActiva: { backgroundColor: '#D7F0E7' },
  pestanaTexto: { fontSize: 14, fontWeight: '600', color: '#586C64' },
  pestanaTextoActiva: { color: '#076451' },
  campo: { gap: 7 },
  etiqueta: { color: '#172825', fontSize: 15, fontWeight: '600' },
  entrada: { borderColor: '#B7CBC3', borderWidth: 1, backgroundColor: '#FFFFFF', minHeight: 52, paddingHorizontal: 14, borderRadius: 12, fontSize: 16, color: '#172825' },
  boton: { minHeight: 50, borderRadius: 12, backgroundColor: '#0D7F6B', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 13 },
  botonTexto: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  botonDeshabilitado: { opacity: 0.55 },
  botonContorno: { minHeight: 50, borderRadius: 12, borderWidth: 1, borderColor: '#0D7F6B', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 13 },
  botonContornoTexto: { color: '#0D7F6B', fontWeight: '700', fontSize: 16 },
  error: { color: '#B42318', fontSize: 14, lineHeight: 21 },
  errorTitulo: { color: '#B42318', fontWeight: '700', fontSize: 17 },
  exito: { color: '#08704B', fontWeight: '700', fontSize: 14, lineHeight: 21 },
  ayuda: { color: '#596C67', lineHeight: 21, fontSize: 14 },
  aviso: { backgroundColor: '#E3F2ED', padding: 17, borderRadius: 14, gap: 7 },
  avisoTitulo: { fontWeight: '700', color: '#075C4C', fontSize: 15 },
});
