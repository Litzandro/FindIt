import { Text, TextInput } from '@/components/ui/inter-text';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Skeleton, SkeletonPerfil } from '@/components/ui/skeleton';
import { tema, tipografia } from '@/features/inicio/ui/tema-findit';
import { useCuenta } from '@/features/auth/use-cuenta';
import { usePublicaciones } from '@/features/objetos/publicaciones';

type Cuenta = ReturnType<typeof useCuenta>;

function Campo({ titulo, valor, onChangeText, placeholder, secreto = false, nombre = false }: {
  titulo: string; valor: string; onChangeText: (valor: string) => void; placeholder: string;
  secreto?: boolean; nombre?: boolean;
}) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{titulo}</Text>
      <TextInput
        accessibilityLabel={titulo}
        style={styles.entrada}
        value={valor}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#929B96"
        autoCapitalize={nombre ? 'words' : 'none'}
        autoComplete={secreto ? 'password' : nombre ? 'name' : 'email'}
        keyboardType={secreto || nombre ? 'default' : 'email-address'}
        secureTextEntry={secreto}
        returnKeyType="next"
      />
    </View>
  );
}

function Avisos({ cuenta }: { cuenta: Cuenta }) {
  return <>
    {!!cuenta.errorConfiguracion && <Text accessibilityRole="alert" style={styles.error}>{cuenta.errorConfiguracion}</Text>}
    {!!cuenta.error && <Text accessibilityRole="alert" style={styles.error}>{cuenta.error}</Text>}
    {!!cuenta.exito && <Text accessibilityLiveRegion="polite" style={styles.exito}>{cuenta.exito}</Text>}
  </>;
}

export function FormularioCuenta({ cuenta }: { cuenta: Cuenta }) {
  if (cuenta.cargando) {
    return (
      <View accessibilityLabel="Cargando sesión" accessibilityRole="progressbar" style={styles.cargando}>
        <Skeleton width="70%" height={31} />
        <Skeleton width="90%" height={15} />
        <Skeleton width="100%" height={52} radius={12} />
        <Skeleton width="100%" height={52} radius={12} />
        <Skeleton width="100%" height={49} radius={12} />
      </View>
    );
  }

  if (cuenta.usuario) return <PanelPerfil cuenta={cuenta} />;

  const registrar = cuenta.modo === 'registrar';
  return (
    <View style={styles.contenido}>
      <Text accessibilityRole="header" style={styles.titulo}>{registrar ? 'Crea tu cuenta' : 'Inicia sesión'}</Text>
      <Text style={styles.subtitulo}>{registrar ? 'Publica objetos y recupera lo que perdiste.' : 'Entra para publicar y reclamar objetos.'}</Text>
      <Avisos cuenta={cuenta} />
      {registrar && <Campo titulo="Nombre completo" valor={cuenta.nombre} onChangeText={cuenta.setNombre} placeholder="Tu nombre" nombre />}
      <Campo titulo="Correo electrónico" valor={cuenta.correo} onChangeText={cuenta.setCorreo} placeholder="tu@correo.com" />
      <Campo titulo="Contraseña" valor={cuenta.contrasena} onChangeText={cuenta.setContrasena} placeholder={registrar ? 'Mínimo 8 caracteres' : 'Tu contraseña'} secreto />
      {registrar && <Campo titulo="Confirmar contraseña" valor={cuenta.confirmacion} onChangeText={cuenta.setConfirmacion} placeholder="Repite tu contraseña" secreto />}
      {registrar ? (
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: cuenta.terminos }} onPress={() => cuenta.setTerminos(!cuenta.terminos)} style={styles.terminos}>
          <View style={[styles.cuadro, cuenta.terminos && styles.cuadroActivo]}><Text style={styles.marcaCheck}>{cuenta.terminos ? '✓' : ''}</Text></View>
          <Text style={styles.terminosTexto}>Acepto las condiciones de uso de FindIt.</Text>
        </Pressable>
      ) : (
        <Pressable accessibilityRole="button" onPress={() => void cuenta.recuperarContrasena()} disabled={cuenta.procesando} style={styles.olvido}>
          <Text style={styles.enlace}>¿Olvidaste tu contraseña?</Text>
        </Pressable>
      )}
      <Pressable accessibilityRole="button" onPress={() => void cuenta.enviar()} disabled={cuenta.procesando || !!cuenta.errorConfiguracion} style={[styles.boton, cuenta.procesando && styles.desactivado]}>
        <Text style={styles.botonTexto}>{cuenta.procesando ? 'Procesando…' : registrar ? 'Crear cuenta' : 'Iniciar sesión'}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" disabled accessibilityState={{ disabled: true }} style={[styles.botonAlterno, styles.googleDesactivado]}>
        <Text style={styles.botonAlternoTexto}>🌐  Continuar con Google · próximamente</Text>
      </Pressable>
      <View style={styles.pie}>
        <Text style={styles.pieTexto}>{registrar ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}</Text>
        <Pressable accessibilityRole="button" onPress={() => cuenta.cambiarModo(registrar ? 'ingresar' : 'registrar')}>
          <Text style={styles.enlace}>{registrar ? 'Inicia sesión' : 'Regístrate'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Vista de perfil según mockups; la edición se hace en una pantalla independiente. */
export function PanelPerfil({ cuenta }: { cuenta: Cuenta }) {
  const { objetos } = usePublicaciones();
  // Las publicaciones no están asociadas al usuario ni guardadas remotamente todavía.
  const pruebasLocales = objetos.filter((objeto) => !objeto.esEjemplo).length;
  return (
    <View style={styles.perfilPrincipal}>
      <Text accessibilityRole="header" style={styles.titulo}>Mi perfil</Text>
      <Avisos cuenta={cuenta} />
      <View style={styles.avatar}><Text style={styles.avatarTexto}>{(cuenta.perfil?.display_name || cuenta.usuario?.email || 'F').trim()[0]?.toUpperCase()}</Text></View>
      <Text style={styles.nombre}>{cuenta.perfil?.display_name || 'Tu nombre'}</Text>
      <Text style={styles.correoPerfil}>{cuenta.usuario?.email}</Text>
      {cuenta.cargandoPerfil ? <SkeletonPerfil /> : !!cuenta.errorPerfil && <Text style={styles.error}>{cuenta.errorPerfil}</Text>}
      <View style={styles.estadisticas}>
        <View style={styles.estadistica}><Text style={styles.numeroEstadistica}>{pruebasLocales}</Text><Text style={styles.etiquetaEstadistica}>Pruebas locales</Text></View>
        <View style={styles.estadistica}><Text style={styles.numeroEstadistica}>—</Text><Text style={styles.etiquetaEstadistica}>Recuperados</Text></View>
        <View style={styles.estadistica}><Text style={styles.numeroEstadistica}>—</Text><Text style={styles.etiquetaEstadistica}>Solicitudes</Text></View>
      </View>
      <Text style={styles.avisoPerfil}>Los contadores de recuperaciones y solicitudes estarán disponibles cuando se implemente su gestión. Las publicaciones de prueba solo existen durante esta sesión.</Text>
      <View style={styles.opcionesPerfil}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/editar-perfil')} style={styles.filaPerfil}>
          <Text style={styles.filaTexto}>Editar perfil</Text><Text style={styles.filaFlecha}>›</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.filaPerfil}>
          <Text style={styles.filaTexto}>Volver al inicio</Text><Text style={styles.filaFlecha}>›</Text>
        </Pressable>
      </View>
      <Pressable accessibilityRole="button" disabled={cuenta.procesando} onPress={() => void cuenta.cerrarSesion()} style={styles.botonSalir}>
        <Text style={styles.salirTexto}>{cuenta.procesando ? 'Cerrando…' : 'Cerrar sesión'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenido: { width: '100%', gap: 16 },
  titulo: { color: tema.texto, fontSize: 34, fontWeight: '800', letterSpacing: -1.15, fontFamily: tipografia.enfasis },
  subtitulo: { color: tema.secundario, fontSize: 15, lineHeight: 22, fontFamily: tipografia.normal },
  campo: { gap: 7 },
  etiqueta: { color: tema.texto, fontWeight: '700', fontSize: 13, fontFamily: tipografia.normal },
  entrada: { backgroundColor: tema.panel, color: tema.texto, fontSize: 15, fontFamily: tipografia.normal, borderColor: tema.borde, borderWidth: 1, borderRadius: 12, minHeight: 52, paddingHorizontal: 14 },
  olvido: { alignSelf: 'flex-start', marginTop: 2, paddingVertical: 2 },
  enlace: { color: tema.verde, fontWeight: '800', fontSize: 13, fontFamily: tipografia.enfasis },
  terminos: { flexDirection: 'row', gap: 11, alignItems: 'center', minHeight: 44 },
  cuadro: { width: 20, height: 20, borderWidth: 1.5, borderColor: '#9EA7A2', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  cuadroActivo: { backgroundColor: tema.verde, borderColor: tema.verde },
  marcaCheck: { color: tema.panel, fontWeight: '800' },
  terminosTexto: { color: tema.secundario, fontSize: 13, flex: 1 },
  boton: { minHeight: 51, justifyContent: 'center', alignItems: 'center', backgroundColor: tema.verde, borderRadius: 11, paddingHorizontal: 10 },
  botonTexto: { color: tema.panel, fontSize: 14, fontWeight: '800', fontFamily: tipografia.enfasis },
  botonAlterno: { minHeight: 49, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: tema.borde, borderRadius: 11, backgroundColor: tema.fondo },
  botonAlternoTexto: { color: tema.texto, fontSize: 13, fontWeight: '700' },
  googleDesactivado: { opacity: 0.63 },
  pie: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 2, flexWrap: 'wrap' },
  pieTexto: { fontSize: 13, color: tema.secundario },
  cargando: { gap: 18, paddingVertical: 35 },
  desactivado: { opacity: 0.7 },
  error: { backgroundColor: '#FCEDEA', color: tema.error, padding: 12, borderRadius: 10, fontSize: 13, lineHeight: 20 },
  exito: { backgroundColor: tema.verdeClaro, color: tema.verdeOscuro, padding: 12, borderRadius: 10, fontSize: 13, lineHeight: 20 },
  avatar: { width: 85, height: 85, borderRadius: 43, backgroundColor: tema.verde, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: 7 },
  avatarTexto: { color: tema.panel, fontWeight: '800', fontSize: 38 },
  nombre: { color: tema.texto, textAlign: 'center', fontWeight: '800', fontSize: 25 },
  correoPerfil: { color: tema.secundario, textAlign: 'center', fontSize: 14, marginTop: -6 },
  perfilPrincipal: { width: '100%', gap: 16, alignItems: 'stretch' },
  estadisticas: { flexDirection: 'row', gap: 10, justifyContent: 'space-between', marginTop: 12 },
  estadistica: { flex: 1, minWidth: 0, backgroundColor: tema.panel, borderColor: tema.borde, borderWidth: 1, borderRadius: 15, paddingVertical: 16, paddingHorizontal: 5, alignItems: 'center' },
  numeroEstadistica: { color: tema.verde, fontWeight: '800', fontSize: 25 },
  etiquetaEstadistica: { color: tema.secundario, fontSize: 10, textAlign: 'center', marginTop: 3 },
  avisoPerfil: { color: tema.secundario, fontSize: 11, lineHeight: 17, marginBottom: 6 },
  opcionesPerfil: { backgroundColor: tema.panel, borderColor: tema.borde, borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  filaPerfil: { minHeight: 62, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: tema.borde, borderBottomWidth: 1 },
  filaTexto: { color: tema.texto, fontWeight: '700', fontSize: 15 },
  filaFlecha: { color: tema.secundario, fontSize: 24 },
  perfilFormulario: { gap: 13 },
  botonSalir: { borderColor: tema.borde, borderWidth: 1, borderRadius: 13, padding: 16, alignItems: 'center', marginTop: 3 },
  salirTexto: { color: tema.error, fontWeight: '700' },
});
