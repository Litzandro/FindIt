import { Text, TextInput } from '@/components/ui/inter-text';
import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CATEGORIAS, LUGARES, fechaHoyLocal, validarPublicacion, type EntradaPublicacion } from '@/features/objetos/modelo';
import { usePublicaciones } from '@/features/objetos/publicaciones';

type ErroresFormulario = Partial<Record<keyof EntradaPublicacion, string>>;

const ZONAS: Record<string, string[]> = {
  Universidad: ['Biblioteca', 'Cafetería', 'Edificio B', 'Parqueo'],
  'Mall Megaplaza': ['Zona de bancos', 'Zona de comida', 'Parqueo'],
};

function Campo({ etiqueta, error, style, ...props }: TextInputProps & { etiqueta: string; error?: string }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        {...props}
        accessibilityLabel={etiqueta}
        placeholderTextColor="#697E77"
        style={[styles.entrada, props.multiline && styles.entradaMultilinea, error && styles.entradaError, style]}
      />
      {error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
    </View>
  );
}

function Opcion({ texto, seleccionada, onPress }: { texto: string; seleccionada: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: seleccionada }}
      onPress={onPress}
      style={({ pressed }) => [styles.opcion, seleccionada && styles.opcionSeleccionada, pressed && styles.presionado]}>
      <Text style={[styles.opcionTexto, seleccionada && styles.opcionTextoSeleccionado]}>{texto}</Text>
    </Pressable>
  );
}

export default function PublicarScreen() {
  const { agregarPublicacion } = usePublicaciones();
  const [fechaDeHoy, setFechaDeHoy] = useState(() => Platform.OS === 'web' ? '' : fechaHoyLocal());
  const [formulario, setFormulario] = useState<EntradaPublicacion>(() => ({
    tipo: 'encontrado', titulo: '', categoria: '', lugar: LUGARES[0], zona: '',
    fechaSuceso: fechaDeHoy, descripcion: '',
  }));
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [errorFoto, setErrorFoto] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [seleccionandoFoto, setSeleccionandoFoto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const envioEnCurso = useRef(false);
  const scroll = useRef<ScrollView>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // El día local puede diferir del día en que se generó el HTML estático.
    const hoy = fechaHoyLocal();
    setFechaDeHoy(hoy);
    setFormulario((actual) => actual.fechaSuceso ? actual : { ...actual, fechaSuceso: hoy });
  }, []);

  function actualizar<K extends keyof EntradaPublicacion>(campo: K, valor: EntradaPublicacion[K]) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }));
    setErrorGeneral('');
  }

  async function seleccionarFoto() {
    setErrorFoto('');
    // En web el selector debe abrirse directamente desde el toque del usuario.
    // No bloqueamos el boton web: algunos navegadores no notifican la cancelacion.
    if (Platform.OS !== 'web') setSeleccionandoFoto(true);
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        allowsEditing: false,
        quality: 0.8,
      });
      if (resultado.canceled) return;
      const foto = resultado.assets[0];
      if (!foto?.uri) {
        setErrorFoto('No pudimos leer esa foto. Selecciona otra imagen.');
        return;
      }
      if (foto.fileSize && foto.fileSize > 10 * 1024 * 1024) {
        setErrorFoto('Selecciona una foto de hasta 10 MB.');
        return;
      }
      actualizar('fotoUri', foto.uri);
    } catch {
      setErrorFoto('No pudimos abrir tus fotos. Revisa los permisos de la aplicación e inténtalo otra vez.');
    } finally {
      setSeleccionandoFoto(false);
    }
  }

  function publicar() {
    if (envioEnCurso.current) return;
    const nuevosErrores = validarPublicacion(formulario);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      setErrorGeneral('Revisa los campos marcados antes de continuar.');
      scroll.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    envioEnCurso.current = true;
    setEnviando(true);
    try {
      agregarPublicacion(formulario);
      router.dismissTo('/');
    } catch {
      envioEnCurso.current = false;
      setEnviando(false);
      setErrorGeneral('No pudimos añadir la publicación. Revisa los datos y vuelve a intentarlo.');
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.cabecera}>
        <View style={styles.cabeceraInterior}>
          <Text style={styles.marca}>FindIt</Text>
          <Pressable accessibilityRole="button" onPress={() => router.dismissTo('/')} style={styles.volver}>
            <Text style={styles.enlace}>← Volver al Inicio</Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}>
        <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <View style={styles.contenido}>
            <Text accessibilityRole="header" style={styles.titulo}>Publicar objeto</Text>
            <Text style={styles.subtitulo}>Cuéntanos qué pasó y dónde. Los campos con * son obligatorios.</Text>

            <View style={styles.aviso}>
              <Text style={styles.avisoTitulo}>Prueba local</Text>
              <Text style={styles.avisoTexto}>Tu publicación aparecerá en este catálogo y se perderá al recargar o cerrar la aplicación.</Text>
            </View>
            {errorGeneral !== '' && <Text accessibilityRole="alert" style={styles.resumenError}>{errorGeneral}</Text>}

            <View style={styles.formulario}>
              <View style={styles.tipoFila}>
                <View style={styles.tipoOpcion}><Opcion texto="Encontré algo" seleccionada={formulario.tipo === 'encontrado'} onPress={() => actualizar('tipo', 'encontrado')} /></View>
                <View style={styles.tipoOpcion}><Opcion texto="Perdí algo" seleccionada={formulario.tipo === 'perdido'} onPress={() => actualizar('tipo', 'perdido')} /></View>
              </View>

              <View style={styles.campo}>
                <Text style={styles.etiqueta}>Foto (opcional)</Text>
                {formulario.fotoUri ? (
                  <View style={styles.fotoContenedor}>
                    <Image
                      source={{ uri: formulario.fotoUri }}
                      accessibilityLabel="Vista previa de la foto del objeto"
                      resizeMode="cover"
                      style={styles.foto}
                      onError={() => {
                        actualizar('fotoUri', undefined);
                        setErrorFoto('No pudimos mostrar esa foto. Prueba con otra imagen.');
                      }}
                    />
                  </View>
                ) : (
                  <Pressable accessibilityRole="button" disabled={seleccionandoFoto} onPress={seleccionarFoto} style={styles.anadirFoto}>
                    <Text accessible={false} style={styles.signoFoto}>+</Text>
                    <Text style={styles.anadirFotoTexto}>{seleccionandoFoto ? 'Abriendo fotos…' : 'Añadir foto'}</Text>
                    <Text style={styles.ayuda}>Selecciona una imagen de hasta 10 MB.</Text>
                  </Pressable>
                )}
                {formulario.fotoUri && (
                  <View style={styles.accionesFoto}>
                    <Pressable accessibilityRole="button" disabled={seleccionandoFoto} onPress={seleccionarFoto} style={styles.botonTexto}>
                      <Text style={styles.enlace}>Cambiar foto</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" onPress={() => { actualizar('fotoUri', undefined); setErrorFoto(''); }} style={styles.botonTexto}>
                      <Text style={styles.quitarTexto}>Quitar foto</Text>
                    </Pressable>
                  </View>
                )}
                {errorFoto !== '' && <Text accessibilityLiveRegion="polite" style={styles.error}>{errorFoto}</Text>}
              </View>

              <Campo etiqueta="¿Qué objeto es? *" placeholder="Ej.: Llaves con llavero rojo" value={formulario.titulo} onChangeText={(valor) => actualizar('titulo', valor)} maxLength={80} error={errores.titulo} />

              <View style={styles.campo}>
                <Text style={styles.etiqueta}>Categoría *</Text>
                <View style={styles.opciones}>
                  {CATEGORIAS.map((categoria) => <Opcion key={categoria} texto={categoria} seleccionada={formulario.categoria === categoria} onPress={() => actualizar('categoria', categoria)} />)}
                </View>
                {errores.categoria && <Text style={styles.error}>{errores.categoria}</Text>}
              </View>

              <View style={styles.campo}>
                <Text style={styles.etiqueta}>Lugar *</Text>
                <View style={styles.opciones}>
                  {LUGARES.map((lugar) => <Opcion key={lugar} texto={lugar} seleccionada={formulario.lugar === lugar} onPress={() => {
                    if (formulario.lugar !== lugar) {
                      actualizar('lugar', lugar);
                      actualizar('zona', '');
                    }
                  }} />)}
                </View>
                {errores.lugar && <Text style={styles.error}>{errores.lugar}</Text>}
              </View>

              <Campo etiqueta="Establecimiento o zona *" placeholder="Ej.: Cafetería, aula 12, parqueo…" value={formulario.zona} onChangeText={(valor) => actualizar('zona', valor)} maxLength={100} error={errores.zona} />
              <View style={styles.opciones}>
                {(ZONAS[formulario.lugar] ?? []).map((zona) => <Opcion key={zona} texto={zona} seleccionada={formulario.zona === zona} onPress={() => actualizar('zona', zona)} />)}
              </View>

              <Campo
                etiqueta={formulario.tipo === 'perdido' ? 'Fecha de pérdida *' : 'Fecha de hallazgo *'}
                placeholder="AAAA-MM-DD"
                value={formulario.fechaSuceso}
                onChangeText={(valor) => actualizar('fechaSuceso', valor)}
                maxLength={10}
                autoCorrect={false}
                autoCapitalize="none"
                error={errores.fechaSuceso}
              />
              <Text style={styles.ayuda}>Formato: año-mes-día. Ejemplo: {fechaDeHoy || 'AAAA-MM-DD'}.</Text>

              <Campo etiqueta="Descripción (opcional)" placeholder="Describe el color, tamaño o dónde lo viste…" multiline value={formulario.descripcion} onChangeText={(valor) => actualizar('descripcion', valor)} maxLength={1000} error={errores.descripcion} />
              <Text style={styles.ayuda}>Usa una ubicación aproximada y reserva algún detalle del objeto para comprobar quién es su dueño.</Text>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: enviando, busy: enviando }}
                disabled={enviando}
                onPress={publicar}
                style={({ pressed }) => [styles.publicarBoton, (pressed || enviando) && styles.presionado]}>
                <Text style={styles.publicarTexto}>{enviando ? 'Añadiendo…' : 'Publicar prueba'}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F4F7F6' },
  flex: { flex: 1 },
  cabecera: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#DBE5E1' },
  cabeceraInterior: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: 20, minHeight: 82, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  marca: { color: '#0D7F6B', fontSize: 30, fontWeight: '800', letterSpacing: -1 },
  volver: { minHeight: 44, justifyContent: 'center', paddingVertical: 10 },
  enlace: { color: '#0D7F6B', fontSize: 14, fontWeight: '700' },
  scroll: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 40 },
  contenido: { width: '100%', maxWidth: 780, alignSelf: 'center', gap: 16 },
  titulo: { color: '#172825', fontSize: 32, fontWeight: '700', letterSpacing: -0.7 },
  subtitulo: { color: '#596C67', fontSize: 16, lineHeight: 24 },
  aviso: { backgroundColor: '#E3F2ED', borderRadius: 14, padding: 16, gap: 6 },
  avisoTitulo: { color: '#075C4C', fontSize: 14, fontWeight: '700' },
  avisoTexto: { color: '#315F52', fontSize: 14, lineHeight: 21 },
  formulario: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DBE5E1', borderRadius: 20, padding: 20, gap: 20 },
  tipoFila: { flexDirection: 'row', gap: 8 },
  tipoOpcion: { flex: 1 },
  campo: { gap: 10 },
  etiqueta: { color: '#172825', fontSize: 16, fontWeight: '600' },
  entrada: { minHeight: 54, borderWidth: 1, borderColor: '#B7CBC3', borderRadius: 13, paddingHorizontal: 15, paddingVertical: 13, fontSize: 16, color: '#172825', backgroundColor: '#FFFFFF' },
  entradaMultilinea: { minHeight: 130, textAlignVertical: 'top' },
  entradaError: { borderColor: '#B42318' },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcion: { minHeight: 44, borderWidth: 1, borderColor: '#DBE5E1', borderRadius: 24, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  opcionSeleccionada: { backgroundColor: '#0D7F6B', borderColor: '#0D7F6B' },
  opcionTexto: { color: '#172825', fontSize: 14, fontWeight: '600' },
  opcionTextoSeleccionado: { color: '#FFFFFF' },
  presionado: { opacity: 0.7 },
  anadirFoto: { minHeight: 158, borderWidth: 2, borderColor: '#A5BEB4', borderStyle: 'dashed', borderRadius: 16, justifyContent: 'center', alignItems: 'center', padding: 16, gap: 8 },
  signoFoto: { color: '#0D7F6B', fontSize: 32 },
  anadirFotoTexto: { color: '#0D7F6B', fontSize: 18, fontWeight: '700' },
  ayuda: { color: '#596C67', fontSize: 13, lineHeight: 20 },
  fotoContenedor: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#E3F2ED' },
  foto: { width: '100%', aspectRatio: 1.5 },
  accionesFoto: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  botonTexto: { minHeight: 44, paddingVertical: 12, justifyContent: 'center' },
  quitarTexto: { color: '#B42318', fontSize: 14, fontWeight: '600' },
  error: { color: '#B42318', fontSize: 13, lineHeight: 20 },
  resumenError: { color: '#B42318', backgroundColor: '#FFF0EC', borderRadius: 12, padding: 14, fontSize: 14, lineHeight: 22 },
  publicarBoton: { minHeight: 54, backgroundColor: '#0D7F6B', borderRadius: 15, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, marginTop: 4 },
  publicarTexto: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
