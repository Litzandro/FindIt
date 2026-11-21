import { Text, TextInput } from '@/components/ui/inter-text';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/auth-context';
import { useFiltrosPublicaciones } from '@/features/inicio/use-filtros-publicaciones';
import { usePublicaciones } from '@/features/objetos/publicaciones';
import type { ObjetoPublicado } from '@/features/objetos/modelo';
import { SkeletonObjeto } from '@/components/ui/skeleton';
import { tema, tipografia } from './tema-findit';
import MarcaFindIt from '@/components/marca-findit';

function Marca() { return <MarcaFindIt ancho={118} />; }

function Tarjeta({ item }: { item: ObjetoPublicado }) {
  const encontrado = item.tipo === 'encontrado';
  return (
    <View style={styles.tarjeta}>
      <View style={[styles.iconoFondo, { backgroundColor: encontrado ? tema.encontrado : tema.perdido }]}>
        {item.fotoUri ? <Image source={{ uri: item.fotoUri }} style={styles.foto} resizeMode="cover" /> : <Text style={styles.icono}>{item.icono}</Text>}
      </View>
      <View style={styles.tarjetaContenido}>
        <Text style={styles.tarjetaTitulo} numberOfLines={1}>{item.titulo}</Text>
        <Text style={styles.tarjetaSubtitulo} numberOfLines={2}>{item.zona} · {item.lugar}</Text>
        <View style={[styles.etiqueta, { backgroundColor: encontrado ? tema.encontrado : tema.perdido }]}>
          <Text style={[styles.etiquetaTexto, { color: encontrado ? tema.verdeOscuro : tema.terracota }]}>{encontrado ? 'Encontrado' : 'Perdido'}</Text>
        </View>
      </View>
    </View>
  );
}

function Filtro({ titulo, activo, onPress }: { titulo: string; activo: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: activo }} style={[styles.filtro, activo && styles.filtroActivo]} onPress={onPress}>
    <Text style={[styles.filtroTexto, activo && styles.filtroTextoActivo]}>{titulo}</Text>
  </Pressable>;
}

export default function InicioMovil() {
  const { usuario, perfil, cargando, cerrarSesion } = useAuth();
  const { objetos } = usePublicaciones();
  const { busqueda, setBusqueda, tipo, setTipo, resultados } = useFiltrosPublicaciones();
  const [menu, setMenu] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    if (saliendo) return;
    setSaliendo(true);
    try { await cerrarSesion(); setMenu(false); }
    catch { setMenu(false); router.push('/cuenta'); }
    finally { setSaliendo(false); }
  }

  if (cargando) return <SafeAreaView style={styles.pantalla}>
    <View style={styles.cabecera}><Marca /></View>
    <View style={styles.cargando}><SkeletonObjeto compacto /><SkeletonObjeto compacto /><SkeletonObjeto compacto /></View>
  </SafeAreaView>;

  if (!usuario) return (
    <SafeAreaView style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.invitado}>
        <Marca />
        <Text accessibilityRole="header" style={styles.titulo}>Lo que perdiste,{"\n"}alguien lo encontró.</Text>
        <Text style={styles.descripcion}>Publica objetos perdidos o encontrados en tu universidad, centro comercial o comunidad.</Text>
        <View style={styles.botonesInvitado}>
          <Link href={{ pathname: '/cuenta', params: { modo: 'registrar' } }} asChild>
            <Pressable accessibilityRole="button" style={styles.botonVerde}><Text style={styles.botonVerdeTexto}>Registrarme</Text></Pressable>
          </Link>
          <Link href={{ pathname: '/cuenta', params: { modo: 'ingresar' } }} asChild>
            <Pressable accessibilityRole="button" style={styles.botonClaro}><Text style={styles.botonClaroTexto}>Iniciar sesión</Text></Pressable>
          </Link>
        </View>
        <View style={styles.listaEjemplos}>{objetos.slice(0, 2).map((item) => <Tarjeta key={item.id} item={item} />)}</View>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.cabecera}>
        <Marca />
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir menú del perfil" accessibilityState={{ expanded: menu }} onPress={() => setMenu(!menu)} style={styles.perfilBoton}>
          <Text style={styles.avatar}>{(perfil?.display_name || usuario.email || 'U').trim().charAt(0).toUpperCase()}</Text><Text style={styles.flecha}>⌄</Text>
        </Pressable>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.catalogo}>
        <TextInput
          accessibilityLabel="Buscar objetos" style={styles.buscador}
          placeholder="Buscar mochila, llaves, audífonos..." placeholderTextColor={tema.secundario}
          value={busqueda} onChangeText={setBusqueda} returnKeyType="search"
        />
        <View style={styles.filtros}>
          <Filtro titulo="Todos" activo={tipo === 'todos'} onPress={() => setTipo('todos')} />
          <Filtro titulo="Perdidos" activo={tipo === 'perdido'} onPress={() => setTipo('perdido')} />
          <Filtro titulo="Encontrados" activo={tipo === 'encontrado'} onPress={() => setTipo('encontrado')} />
        </View>
        {resultados.map((item) => <Tarjeta key={item.id} item={item} />)}
        {resultados.length === 0 && <Text style={styles.vacio}>No encontramos objetos con esos filtros.</Text>}
        <Text style={styles.nota}>Publicaciones de prueba: el guardado definitivo en Supabase está pendiente.</Text>
      </ScrollView>
      {menu && <View style={styles.menu}>
        <Text style={styles.menuTitulo}>{perfil?.display_name || 'Tu nombre'}</Text>
        <Text style={styles.menuCorreo} numberOfLines={1}>{usuario.email}</Text>
        <Pressable accessibilityRole="button" onPress={() => { setMenu(false); router.push('/cuenta'); }} style={styles.menuOpcion}><Text style={styles.menuOpcionTexto}>Mi perfil</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => void salir()} disabled={saliendo} style={styles.menuOpcion}><Text style={styles.menuSalir}>Cerrar sesión</Text></Pressable>
      </View>}
      <View style={styles.navegacion}>
        <View style={styles.navItem}><Text style={styles.navActivo}>Inicio</Text></View>
        <Link href="/publicar" asChild><Pressable accessibilityRole="button" style={styles.publicar}><Text style={styles.publicarTexto}>+ Publicar</Text></Pressable></Link>
        <Link href="/cuenta" asChild><Pressable accessibilityRole="button" style={styles.navItem}><Text style={styles.navTexto}>Mi perfil</Text></Pressable></Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: tema.fondo },
  invitado: { flexGrow: 1, paddingHorizontal: 21, paddingTop: 29, paddingBottom: 42 },
  marca: { fontSize: 29, fontWeight: '800', letterSpacing: -1.3, fontFamily: tipografia.enfasis },
  titulo: { color: tema.texto, fontWeight: '800', fontSize: 39, lineHeight: 44, letterSpacing: -1.2, marginTop: 35, fontFamily: tipografia.enfasis },
  descripcion: { color: tema.secundario, fontSize: 15, lineHeight: 23, marginTop: 19 },
  botonesInvitado: { marginTop: 27, gap: 12 },
  botonVerde: { minHeight: 52, backgroundColor: tema.verde, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  botonVerdeTexto: { color: tema.panel, fontWeight: '800', fontSize: 14 },
  botonClaro: { minHeight: 52, borderColor: tema.borde, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  botonClaroTexto: { color: tema.texto, fontWeight: '700', fontSize: 14 },
  listaEjemplos: { marginTop: 28, gap: 12 },
  cabecera: { minHeight: 77, paddingHorizontal: 21, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  perfilBoton: { borderRadius: 25, padding: 5, gap: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: tema.panel, borderWidth: 1, borderColor: tema.borde },
  avatar: { color: tema.panel, backgroundColor: tema.verde, borderRadius: 22, overflow: 'hidden', width: 38, height: 38, textAlign: 'center', textAlignVertical: 'center', paddingTop: 8, fontWeight: '800', fontSize: 18 },
  flecha: { color: tema.texto, paddingRight: 9, fontSize: 18 },
  catalogo: { paddingHorizontal: 21, paddingTop: 8, paddingBottom: 35, gap: 12 },
  buscador: { minHeight: 53, borderRadius: 12, borderColor: tema.borde, borderWidth: 1, backgroundColor: tema.panel, paddingHorizontal: 15, color: tema.texto, fontSize: 14 },
  filtros: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginVertical: 4 },
  filtro: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 30, borderWidth: 1, borderColor: tema.borde, backgroundColor: tema.panel },
  filtroActivo: { backgroundColor: tema.verde, borderColor: tema.verde },
  filtroTexto: { color: tema.texto, fontWeight: '700', fontSize: 13 },
  filtroTextoActivo: { color: tema.panel },
  tarjeta: { backgroundColor: tema.panel, borderWidth: 1, borderColor: tema.borde, borderRadius: 16, padding: 10, flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconoFondo: { width: 67, height: 67, borderRadius: 11, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  foto: { width: '100%', height: '100%' },
  icono: { fontSize: 27 },
  tarjetaContenido: { flex: 1, gap: 4 },
  tarjetaTitulo: { fontWeight: '800', color: tema.texto, fontSize: 15 },
  tarjetaSubtitulo: { color: tema.secundario, fontSize: 12 },
  etiqueta: { alignSelf: 'flex-start', borderRadius: 30, paddingHorizontal: 9, paddingVertical: 3 },
  etiquetaTexto: { fontSize: 11, fontWeight: '700' },
  vacio: { textAlign: 'center', color: tema.secundario, paddingVertical: 30 },
  nota: { fontSize: 11, lineHeight: 16, textAlign: 'center', color: tema.secundario, marginTop: 12 },
  navegacion: { minHeight: 79, backgroundColor: tema.panel, borderTopWidth: 1, borderTopColor: tema.borde, flexDirection: 'row', gap: 9, justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 16 },
  navItem: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center' },
  navActivo: { color: tema.verde, fontWeight: '800', fontSize: 12 },
  navTexto: { color: tema.secundario, fontWeight: '700', fontSize: 12 },
  publicar: { backgroundColor: tema.verde, borderRadius: 12, minHeight: 53, justifyContent: 'center', paddingHorizontal: 24 },
  publicarTexto: { color: tema.panel, fontWeight: '800', fontSize: 13 },
  menu: { position: 'absolute', top: 70, right: 20, backgroundColor: tema.panel, width: 230, borderWidth: 1, borderColor: tema.borde, borderRadius: 14, padding: 13, gap: 6, zIndex: 30, elevation: 8 },
  menuTitulo: { fontSize: 15, fontWeight: '800', color: tema.texto },
  menuCorreo: { color: tema.secundario, fontSize: 12, marginBottom: 4 },
  menuOpcion: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: tema.borde },
  menuOpcionTexto: { color: tema.texto, fontSize: 14, fontWeight: '700' },
  menuSalir: { color: tema.error, fontWeight: '700', fontSize: 14 },
  cargando: { padding: 20, gap: 12 },
});
