import { Text, TextInput } from '@/components/ui/inter-text';
import { useEffect, useState } from 'react';
import { Link, router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/auth-context';
import { SkeletonObjeto } from '@/components/ui/skeleton';
import { useFiltrosPublicaciones, CATEGORIAS, LUGARES } from '@/features/inicio/use-filtros-publicaciones';
import { tema, tipografia } from './tema-findit';
import MarcaFindIt from '@/components/marca-findit';

function Opcion({ texto, activa, elegir }: { texto: string; activa: boolean; elegir: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: activa }} onPress={elegir} style={[styles.opcion, activa && styles.opcionActiva]}>
    <Text style={[styles.opcionTexto, activa && styles.opcionTextoActivo]}>{texto}</Text>
  </Pressable>;
}

export default function CatalogoWeb() {
  const { usuario, perfil, cargando, cerrarSesion } = useAuth();
  const { busqueda, setBusqueda, tipo, setTipo, lugar, setLugar, categoria, setCategoria, resultados, limpiarFiltros } = useFiltrosPublicaciones();
  const [menu, setMenu] = useState(false);
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const [montado, setMontado] = useState(false);
  const { width } = useWindowDimensions();
  useEffect(() => setMontado(true), []);
  const ancho = montado && width > 0 ? width : 1200;
  const compacto = ancho < 800;
  const columnas = ancho > 1320 ? 3 : ancho > 850 ? 2 : 1;

  async function salir() {
    try { await cerrarSesion(); setMenu(false); router.replace('/'); }
    catch { router.push('/cuenta'); }
  }

  const filtros = (
    <View style={styles.panelFiltros}>
      <Text style={styles.filtrosTitulo}>Filtros</Text>
      <Text style={styles.seccionFiltro}>Lugar</Text>
      {LUGARES.map((opcion) => <Opcion key={opcion} texto={opcion} activa={lugar === opcion} elegir={() => setLugar(opcion)} />)}
      <Text style={styles.seccionFiltro}>Tipo</Text>
      <Opcion texto="Todos" activa={tipo === 'todos'} elegir={() => setTipo('todos')} />
      <Opcion texto="Perdidos" activa={tipo === 'perdido'} elegir={() => setTipo('perdido')} />
      <Opcion texto="Encontrados" activa={tipo === 'encontrado'} elegir={() => setTipo('encontrado')} />
      <Text style={styles.seccionFiltro}>Categoría</Text>
      {CATEGORIAS.map((opcion) => <Opcion key={opcion} texto={opcion} activa={categoria === opcion} elegir={() => setCategoria(opcion)} />)}
      <Pressable accessibilityRole="button" onPress={limpiarFiltros} style={styles.limpiar}><Text style={styles.limpiarTexto}>Limpiar filtros</Text></Pressable>
    </View>
  );

  return <SafeAreaView style={styles.pantalla}>
    <View style={styles.cabecera}>
      <View style={styles.cabeceraContenido}>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/')}>
          <MarcaFindIt ancho={112} />
        </Pressable>
        {!compacto && <View style={styles.buscador}>
          <TextInput accessibilityLabel="Buscar objetos" style={styles.buscadorEntrada} placeholder="Buscar mochila, llaves, audífonos..." placeholderTextColor={tema.secundario} value={busqueda} onChangeText={setBusqueda} />
        </View>}
        <View style={styles.cabeceraAcciones}>
          <Link href="/publicar" asChild><Pressable accessibilityRole="button" style={styles.botonPublicar}><Text style={styles.botonPublicarTexto}>+ Publicar objeto</Text></Pressable></Link>
          {usuario ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Menú del perfil" accessibilityState={{ expanded: menu }} onPress={() => setMenu(!menu)} style={styles.perfil}>
              <Text style={styles.avatar}>{(perfil?.display_name || usuario.email || 'F').trim().charAt(0).toUpperCase()}</Text><Text style={styles.flecha}>⌄</Text>
            </Pressable>
          ) : <Link href="/cuenta" asChild><Pressable accessibilityRole="button" style={styles.ingresar}><Text style={styles.ingresarTexto}>Ingresar</Text></Pressable></Link>}
        </View>
      </View>
      {menu && <View style={styles.menu}>
        <Text style={styles.menuTitulo}>{perfil?.display_name || 'Mi cuenta'}</Text>
        <Text style={styles.menuCorreo} numberOfLines={1}>{usuario?.email}</Text>
        <Pressable accessibilityRole="button" onPress={() => { setMenu(false); router.push('/cuenta'); }} style={styles.menuFila}><Text style={styles.menuTexto}>Mi perfil</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => void salir()} style={styles.menuFila}><Text style={styles.menuSalir}>Cerrar sesión</Text></Pressable>
      </View>}
    </View>
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      {compacto && <TextInput accessibilityLabel="Buscar objetos" style={styles.buscadorCompacto} placeholder="Buscar mochila, llaves, audífonos..." placeholderTextColor={tema.secundario} value={busqueda} onChangeText={setBusqueda} />}
      {compacto && <Pressable accessibilityRole="button" accessibilityState={{ expanded: filtrosVisibles }} onPress={() => setFiltrosVisibles(!filtrosVisibles)} style={styles.filtroCompacto}><Text style={styles.limpiarTexto}>{filtrosVisibles ? 'Ocultar filtros' : 'Mostrar filtros'}</Text></Pressable>}
      <View style={[styles.contenido, compacto && styles.contenidoCompacto]}>
        {(!compacto || filtrosVisibles) && filtros}
        <View style={styles.resultados}>
          <View style={styles.tituloFila}>
            <Text accessibilityRole="header" style={styles.titulo}>Objetos recientes</Text>
            {!cargando && <Text style={styles.contador}>{resultados.length} {resultados.length === 1 ? 'objeto' : 'objetos'}</Text>}
          </View>
          {cargando ? <View style={styles.grilla}>
            {Array.from({ length: 6 }, (_, i) => <View key={i} style={{ width: columnas === 3 ? '31.9%' : columnas === 2 ? '48.5%' : '100%' }}><SkeletonObjeto /></View>)}
          </View> : <View style={styles.grilla}>
            {resultados.map((objeto) => {
              const encontrado = objeto.tipo === 'encontrado';
              return <View key={objeto.id} style={[styles.tarjeta, { width: columnas === 3 ? '31.9%' : columnas === 2 ? '48.5%' : '100%' }]}>
                <View style={[styles.imagen, { backgroundColor: encontrado ? tema.encontrado : tema.perdido }]}>
                  {objeto.fotoUri ? <Image source={{ uri: objeto.fotoUri }} resizeMode="cover" style={styles.foto} /> : <Text style={styles.icono}>{objeto.icono}</Text>}
                </View>
                <View style={styles.tarjetaDatos}>
                  <Text style={styles.objetoTitulo} numberOfLines={1}>{objeto.titulo}</Text>
                  <Text style={styles.objetoLugar} numberOfLines={1}>{objeto.zona} · {objeto.lugar}</Text>
                  <Text style={styles.objetoFecha}>{objeto.fecha}</Text>
                  <View style={[styles.badge, { backgroundColor: encontrado ? tema.encontrado : tema.perdido }]}>
                    <Text style={[styles.badgeTexto, { color: encontrado ? tema.verdeOscuro : tema.terracota }]}>{encontrado ? 'Encontrado' : 'Perdido'}</Text>
                  </View>
                </View>
              </View>;
            })}
          </View>}
          {!cargando && resultados.length === 0 && <View style={styles.vacio}><Text style={styles.vacioTitulo}>No hay resultados</Text><Text style={styles.vacioTexto}>Prueba con otros filtros.</Text></View>}
          <Text style={styles.nota}>Los objetos visibles son datos de demostración; las publicaciones reales todavía no se sincronizan con Supabase.</Text>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: tema.fondo },
  cabecera: { backgroundColor: tema.panel, borderBottomWidth: 1, borderColor: tema.borde, zIndex: 5 },
  cabeceraContenido: { width: '100%', maxWidth: 1390, minHeight: 76, alignSelf: 'center', paddingHorizontal: 25, alignItems: 'center', justifyContent: 'space-between', gap: 20, flexDirection: 'row' },
  marca: { fontSize: 27, fontWeight: '800', letterSpacing: -1, fontFamily: tipografia.enfasis },
  buscador: { borderWidth: 1, borderColor: tema.borde, borderRadius: 10, backgroundColor: tema.panel, width: 370, maxWidth: '40%' },
  buscadorEntrada: { height: 44, paddingHorizontal: 13, fontSize: 14, color: tema.texto },
  cabeceraAcciones: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  botonPublicar: { paddingHorizontal: 17, minHeight: 42, borderRadius: 25, backgroundColor: tema.verde, justifyContent: 'center' },
  botonPublicarTexto: { fontSize: 13, color: tema.panel, fontWeight: '800' },
  perfil: { padding: 4, borderWidth: 1, borderColor: tema.borde, borderRadius: 22, flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatar: { backgroundColor: tema.verde, borderRadius: 18, width: 36, height: 36, overflow: 'hidden', color: tema.panel, fontWeight: '800', fontSize: 17, textAlign: 'center', paddingTop: 7 },
  flecha: { color: tema.texto, paddingRight: 6 },
  ingresar: { paddingVertical: 10 }, ingresarTexto: { color: tema.verde, fontSize: 14, fontWeight: '800' },
  menu: { position: 'absolute', top: 70, right: 24, width: 235, borderRadius: 13, borderWidth: 1, borderColor: tema.borde, backgroundColor: tema.panel, padding: 15, zIndex: 20, elevation: 6 },
  menuTitulo: { fontSize: 14, fontWeight: '800', color: tema.texto },
  menuCorreo: { fontSize: 12, color: tema.secundario, marginTop: 4, marginBottom: 8 },
  menuFila: { paddingVertical: 13, borderTopWidth: 1, borderColor: tema.borde },
  menuTexto: { fontSize: 14, color: tema.texto, fontWeight: '700' }, menuSalir: { fontSize: 14, color: tema.error, fontWeight: '700' },
  scroll: { maxWidth: 1390, width: '100%', alignSelf: 'center', padding: 26, paddingBottom: 60 },
  buscadorCompacto: { height: 48, paddingHorizontal: 14, backgroundColor: tema.panel, borderColor: tema.borde, borderWidth: 1, borderRadius: 11, color: tema.texto, marginBottom: 14 },
  filtroCompacto: { alignSelf: 'flex-start', padding: 10 },
  contenido: { flexDirection: 'row', alignItems: 'flex-start', gap: 21 },
  contenidoCompacto: { flexDirection: 'column' },
  panelFiltros: { backgroundColor: tema.panel, borderWidth: 1, borderColor: tema.borde, borderRadius: 15, padding: 20, width: 240, maxWidth: '100%', gap: 7 },
  filtrosTitulo: { color: tema.texto, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  seccionFiltro: { color: tema.texto, fontSize: 13, fontWeight: '800', marginTop: 14 },
  opcion: { minHeight: 30, borderRadius: 8, paddingHorizontal: 10, justifyContent: 'center' },
  opcionActiva: { backgroundColor: tema.verdeClaro },
  opcionTexto: { color: tema.secundario, fontSize: 12 },
  opcionTextoActivo: { color: tema.verdeOscuro, fontWeight: '800' },
  limpiar: { paddingTop: 15 }, limpiarTexto: { color: tema.verde, fontWeight: '800', fontSize: 12 },
  resultados: { flex: 1, minWidth: 0 },
  tituloFila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 17 },
  titulo: { fontSize: 26, fontWeight: '800', color: tema.texto, letterSpacing: -0.8 },
  contador: { fontSize: 13, color: tema.secundario },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: '1.5%', rowGap: 18 },
  tarjeta: { borderWidth: 1, borderColor: tema.borde, backgroundColor: tema.panel, borderRadius: 14, overflow: 'hidden' },
  imagen: { height: 160, alignItems: 'center', justifyContent: 'center' },
  foto: { width: '100%', height: '100%' },
  icono: { fontSize: 48 },
  tarjetaDatos: { padding: 13, gap: 5 },
  objetoTitulo: { fontSize: 15, fontWeight: '800', color: tema.texto },
  objetoLugar: { fontSize: 12, color: tema.secundario },
  objetoFecha: { fontSize: 11, color: tema.secundario },
  badge: { alignSelf: 'flex-start', borderRadius: 22, paddingVertical: 4, paddingHorizontal: 9, marginTop: 4 },
  badgeTexto: { fontSize: 11, fontWeight: '700' },
  vacio: { padding: 24, alignItems: 'center' },
  vacioTitulo: { fontSize: 18, fontWeight: '800', color: tema.texto },
  vacioTexto: { color: tema.secundario },
  nota: { marginTop: 20, color: tema.secundario, fontSize: 11, lineHeight: 17 },
});
