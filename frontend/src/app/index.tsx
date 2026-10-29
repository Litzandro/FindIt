import { useEffect, useRef, useState } from 'react';
import { Link } from 'expo-router';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORIAS as CATEGORIAS_BASE, LUGARES as LUGARES_BASE, type FiltroTipo } from '@/features/objetos/modelo';
import { usePublicaciones } from '@/features/objetos/publicaciones';

const TIPOS: { valor: FiltroTipo; etiqueta: string }[] = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'perdido', etiqueta: 'Perdidos' },
  { valor: 'encontrado', etiqueta: 'Encontrados' },
];
const LUGARES = ['Todos los lugares', ...LUGARES_BASE];
const CATEGORIAS = ['Todas las categorías', ...CATEGORIAS_BASE];

const colores = {
  fondo: '#F4F7F6', blanco: '#FFFFFF', texto: '#172825', secundario: '#596C67',
  verde: '#0D7F6B', borde: '#DBE5E1', verdeClaro: '#D5F0E8',
  amarilloClaro: '#FDECC8', amarillo: '#805100',
};

// Permite encontrar "audifonos" aunque el titulo diga "Audífonos".
function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function Opcion({ etiqueta, activa, onPress }: {
  etiqueta: string;
  activa: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activa }}
      onPress={onPress}
      style={({ pressed }) => [styles.opcion, activa && styles.opcionActiva, pressed && styles.presionado]}>
      <Text style={[styles.opcionTexto, activa && styles.opcionTextoActivo]}>{etiqueta}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { objetos } = usePublicaciones();
  const ultimaPublicacion = objetos.find((objeto) => !objeto.esEjemplo);
  const scroll = useRef<ScrollView>(null);
  // Cada estado guarda una eleccion del usuario y actualiza la pantalla.
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState<FiltroTipo>('todos');
  const [lugar, setLugar] = useState(LUGARES[0]);
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [montado, setMontado] = useState(Platform.OS !== 'web');
  const { width: anchoVentana } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const anchoDisponible = anchoVentana - insets.left - insets.right;

  useEffect(() => {
    setMontado(true);
  }, []);

  // El HTML estático y el primer render web usan el mismo ancho inicial.
  // Después de montar, se adapta al navegador y a sus cambios de tamaño.
  const width = montado && anchoDisponible > 0 ? anchoDisponible : 390;

  const escritorio = width >= 1000;
  const compacto = width < 650;
  const margen = compacto ? 20 : 32;
  const anchoContenido = Math.min(width - margen * 2, 1320);
  const columnas = compacto ? 1 : width >= 1400 ? 3 : 2;
  const anchoResultados = anchoContenido - (escritorio ? 272 : 0);
  const anchoTarjeta = (anchoResultados - (columnas - 1) * 16) / columnas;
  const termino = normalizar(busqueda);
  const filtrosActivos = busqueda !== '' || tipo !== 'todos' || lugar !== LUGARES[0] || categoria !== CATEGORIAS[0];
  const filtrosExtra = Number(lugar !== LUGARES[0]) + Number(categoria !== CATEGORIAS[0]);

  const resultados = objetos.filter((objeto) => {
    const contenido = normalizar(`${objeto.titulo} ${objeto.categoria} ${objeto.lugar} ${objeto.zona} ${objeto.descripcion}`);
    return contenido.includes(termino)
      && (tipo === 'todos' || objeto.tipo === tipo)
      && (lugar === LUGARES[0] || objeto.lugar === lugar)
      && (categoria === CATEGORIAS[0] || objeto.categoria === categoria);
  });

  function limpiarFiltros() {
    setBusqueda('');
    setTipo('todos');
    setLugar(LUGARES[0]);
    setCategoria(CATEGORIAS[0]);
  }

  const panelFiltros = (
    <View style={[styles.panel, escritorio && styles.panelLateral]}>
      <Text style={styles.panelTitulo}>Filtros</Text>
      <Text style={styles.etiqueta}>Lugar</Text>
      <View style={styles.opciones}>
        {LUGARES.map((opcion) => (
          <Opcion key={opcion} etiqueta={opcion} activa={lugar === opcion} onPress={() => setLugar(opcion)} />
        ))}
      </View>
      <Text style={styles.etiqueta}>Categoría</Text>
      <View style={styles.opciones}>
        {CATEGORIAS.map((opcion) => (
          <Opcion key={opcion} etiqueta={opcion} activa={categoria === opcion} onPress={() => setCategoria(opcion)} />
        ))}
      </View>
      {filtrosActivos && (
        <Pressable accessibilityRole="button" onPress={limpiarFiltros} style={styles.botonTexto}>
          <Text style={styles.enlace}>Limpiar filtros</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.cabecera}>
        <View style={[styles.cabeceraInterior, { paddingHorizontal: margen }]}>
          <Text style={styles.marca}>FindIt</Text>
          <View style={styles.cabeceraAcciones}>
            {!compacto && <View style={styles.demoEtiqueta}><Text style={styles.demoTexto}>Prueba local</Text></View>}
            <Link href="/publicar" asChild>
              <Pressable accessibilityRole="button" style={({ pressed }) => [styles.publicarBoton, pressed && styles.presionado]}>
                <Text style={styles.publicarTexto}>+ Publicar</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>

      {ultimaPublicacion && (
        <View style={[styles.confirmacion, { width: anchoContenido }]}>
          <Text accessibilityLiveRegion="polite" style={styles.confirmacionTexto}>Publicación añadida a esta prueba: {ultimaPublicacion.titulo}.</Text>
          <Pressable accessibilityRole="button" style={styles.botonTexto} onPress={() => {
            limpiarFiltros();
            scroll.current?.scrollTo({ y: 0, animated: true });
          }}>
            <Text style={styles.enlace}>Ver en el catálogo</Text>
          </Pressable>
        </View>
      )}
      <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: margen, paddingBottom: 40 }}>
        <View style={[styles.contenido, { width: anchoContenido }]}>
          <View style={styles.introduccion}>
            <Text accessibilityRole="header" style={[styles.titulo, compacto && styles.tituloMovil]}>Cada objeto tiene una historia.</Text>
            <Text style={styles.subtitulo}>Ayudemos a que vuelva a su dueño.</Text>
          </View>

          <View style={styles.buscador}>
            <View accessible={false} style={styles.lupa}><View style={styles.lupaMango} /></View>
            <TextInput
              accessibilityLabel="Buscar objetos por nombre, categoría o lugar"
              placeholder="Buscar mochila, llaves, audífonos..."
              placeholderTextColor={colores.secundario}
              value={busqueda}
              onChangeText={setBusqueda}
              autoCorrect={false}
              returnKeyType="search"
              style={styles.entrada}
            />
            {busqueda.length > 0 && (
              <Pressable accessibilityRole="button" accessibilityLabel="Borrar búsqueda" onPress={() => setBusqueda('')} style={styles.borrar}>
                <Text style={styles.borrarTexto}>×</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.barraFiltros}>
            <View style={styles.tipos}>
              {TIPOS.map((opcion) => (
                <Opcion key={opcion.valor} etiqueta={opcion.etiqueta} activa={tipo === opcion.valor} onPress={() => setTipo(opcion.valor)} />
              ))}
            </View>
            {!escritorio && (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: filtrosAbiertos }}
                onPress={() => setFiltrosAbiertos(!filtrosAbiertos)}
                style={styles.botonTexto}>
                <Text style={styles.enlace}>{filtrosAbiertos ? 'Ocultar filtros' : `Filtros${filtrosExtra ? ` (${filtrosExtra})` : ''}`}</Text>
              </Pressable>
            )}
          </View>

          {!escritorio && filtrosAbiertos && panelFiltros}

          <View style={[styles.resultadosFila, !escritorio && styles.resultadosColumna]}>
            {escritorio && panelFiltros}
            <View style={[styles.resultados, !escritorio && styles.resultadosMovil]}>
              <View style={styles.resultadosCabecera}>
                <Text accessibilityRole="header" style={styles.seccionTitulo}>Objetos recientes</Text>
                <Text accessibilityLiveRegion="polite" style={styles.contador}>{resultados.length} {resultados.length === 1 ? 'objeto' : 'objetos'}</Text>
              </View>

              <View style={styles.cuadricula}>
                {resultados.map((objeto) => {
                  const encontrado = objeto.tipo === 'encontrado';
                  const fondoTipo = encontrado ? colores.verdeClaro : colores.amarilloClaro;
                  const textoTipo = encontrado ? '#075C4C' : colores.amarillo;
                  return (
                    <View key={objeto.id} style={[styles.tarjeta, { width: anchoTarjeta }, compacto && styles.tarjetaMovil]}>
                      <View style={[styles.imagen, { backgroundColor: fondoTipo }, compacto && styles.imagenMovil]}>
                        {objeto.fotoUri ? (
                          <Image source={{ uri: objeto.fotoUri }} accessibilityLabel={`Foto de ${objeto.titulo}`} resizeMode="cover" style={styles.fotoObjeto} />
                        ) : (
                          <Text accessible={false} style={styles.icono}>{objeto.icono}</Text>
                        )}
                      </View>
                      <View style={styles.tarjetaContenido}>
                        <Text style={styles.objetoTitulo}>{objeto.titulo}</Text>
                        <Text style={styles.objetoZona}>{objeto.zona} · {objeto.lugar}</Text>
                        <Text style={styles.objetoFecha}>Fecha: {objeto.fecha}</Text>
                        {!objeto.esEjemplo && <Text style={styles.nuevaEtiqueta}>Creada en esta prueba</Text>}
                        <View style={[styles.insignia, { backgroundColor: fondoTipo }]}>
                          <Text style={[styles.insigniaTexto, { color: textoTipo }]}>{encontrado ? 'Encontrado' : 'Perdido'}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              {resultados.length === 0 && (
                <View style={styles.vacio}>
                  <Text style={styles.panelTitulo}>No encontramos objetos</Text>
                  <Text style={styles.vacioTexto}>Prueba otra palabra o cambia los filtros.</Text>
                  <Pressable accessibilityRole="button" onPress={limpiarFiltros} style={styles.botonPrincipal}>
                    <Text style={styles.botonPrincipalTexto}>Limpiar búsqueda y filtros</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.nota}>Prueba local: las publicaciones nuevas y sus fotos se pierden al recargar o cerrar la aplicación.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  cabecera: { backgroundColor: colores.blanco, borderBottomWidth: 1, borderBottomColor: colores.borde },
  cabeceraInterior: { width: '100%', maxWidth: 1384, alignSelf: 'center', minHeight: 90, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  marca: { fontSize: 34, fontWeight: '800', color: colores.verde, letterSpacing: -1.2 },
  cabeceraAcciones: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  publicarBoton: { minHeight: 46, borderRadius: 24, backgroundColor: colores.verde, paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'center' },
  publicarTexto: { color: colores.blanco, fontSize: 15, fontWeight: '700' },
  confirmacion: { alignSelf: 'center', padding: 14, marginTop: 14, borderRadius: 14, backgroundColor: colores.verdeClaro },
  confirmacionTexto: { fontSize: 14, lineHeight: 21, color: '#075C4C', fontWeight: '600' },
  demoEtiqueta: { borderRadius: 20, backgroundColor: colores.fondo, paddingHorizontal: 12, paddingVertical: 8 },
  demoTexto: { fontSize: 12, fontWeight: '600', color: colores.secundario },
  contenido: { alignSelf: 'center' },
  introduccion: { paddingTop: 40, paddingBottom: 24, gap: 8 },
  titulo: { fontSize: 32, fontWeight: '700', color: colores.texto, letterSpacing: -0.8 },
  tituloMovil: { fontSize: 27 },
  subtitulo: { fontSize: 17, lineHeight: 25, color: colores.secundario },
  buscador: { minHeight: 58, borderRadius: 16, borderWidth: 1, borderColor: '#B7CBC3', backgroundColor: colores.blanco, flexDirection: 'row', alignItems: 'center', paddingLeft: 20, gap: 14 },
  lupa: { height: 16, width: 16, borderWidth: 2, borderColor: colores.secundario, borderRadius: 8, marginRight: 3 },
  lupaMango: { width: 8, height: 2, backgroundColor: colores.secundario, position: 'absolute', bottom: -4, right: -6, transform: [{ rotate: '45deg' }] },
  entrada: { flex: 1, minWidth: 0, minHeight: 56, fontSize: 16, color: colores.texto, paddingVertical: 14, paddingRight: 14 },
  borrar: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  borrarTexto: { fontSize: 28, color: colores.secundario },
  barraFiltros: { paddingVertical: 22, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  tipos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcion: { minHeight: 44, borderRadius: 24, borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.blanco, paddingHorizontal: 16, paddingVertical: 11, justifyContent: 'center' },
  opcionActiva: { backgroundColor: colores.verde, borderColor: colores.verde },
  opcionTexto: { fontSize: 14, fontWeight: '600', color: colores.texto },
  opcionTextoActivo: { color: colores.blanco },
  presionado: { opacity: 0.75 },
  panel: { backgroundColor: colores.blanco, padding: 20, borderRadius: 18, borderWidth: 1, borderColor: colores.borde, gap: 12, marginBottom: 20 },
  panelLateral: { width: 248 },
  panelTitulo: { fontSize: 20, fontWeight: '700', color: colores.texto },
  etiqueta: { fontSize: 15, fontWeight: '600', color: colores.texto, marginTop: 8 },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  botonTexto: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  enlace: { color: colores.verde, fontSize: 14, fontWeight: '700' },
  resultadosFila: { flexDirection: 'row', alignItems: 'flex-start', gap: 24 },
  resultadosColumna: { flexDirection: 'column', gap: 0 },
  resultados: { flex: 1, width: '100%', minWidth: 0 },
  resultadosMovil: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' },
  resultadosCabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  seccionTitulo: { color: colores.texto, fontSize: 22, fontWeight: '700' },
  contador: { color: colores.secundario, fontSize: 14 },
  cuadricula: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  tarjeta: { borderRadius: 18, borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.blanco, overflow: 'hidden' },
  tarjetaMovil: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  imagen: { height: 150, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  imagenMovil: { width: 80, height: 96, borderRadius: 14 },
  icono: { fontSize: 40 },
  fotoObjeto: { width: '100%', height: '100%' },
  nuevaEtiqueta: { color: colores.verde, fontSize: 12, fontWeight: '600' },
  tarjetaContenido: { padding: 18, flexGrow: 1, flexShrink: 1, gap: 8 },
  objetoTitulo: { fontSize: 18, fontWeight: '700', lineHeight: 25, color: colores.texto },
  objetoZona: { fontSize: 14, lineHeight: 21, color: colores.secundario },
  objetoFecha: { fontSize: 12, color: colores.secundario },
  insignia: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start' },
  insigniaTexto: { fontSize: 13, fontWeight: '700' },
  vacio: { backgroundColor: colores.blanco, borderWidth: 1, borderColor: colores.borde, borderRadius: 18, padding: 28, alignItems: 'center', gap: 14 },
  vacioTexto: { fontSize: 15, color: colores.secundario, lineHeight: 23, textAlign: 'center' },
  botonPrincipal: { backgroundColor: colores.verde, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, minHeight: 48 },
  botonPrincipalTexto: { color: colores.blanco, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  nota: { textAlign: 'center', color: colores.secundario, fontSize: 12, lineHeight: 20, paddingTop: 28 },
});
