import { Text } from '@/components/ui/inter-text';
import { useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/auth-context';
import { usePublicaciones } from '@/features/objetos/publicaciones';
import type { ObjetoPublicado } from '@/features/objetos/modelo';
import { SkeletonObjeto } from '@/components/ui/skeleton';
import { tema, tipografia } from './tema-findit';
import CatalogoWeb from './Catalogo.web';
import MarcaFindIt from '@/components/marca-findit';

function Marca() { return <MarcaFindIt ancho={127} />; }

function Ejemplo({ objeto, onPress }: { objeto: ObjetoPublicado; onPress: () => void }) {
  const encontrado = objeto.tipo === 'encontrado';
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.ejemplo}>
      <View style={[styles.iconoFondo, { backgroundColor: encontrado ? tema.encontrado : tema.perdido }]}><Text style={styles.icono}>{objeto.icono}</Text></View>
      <View style={styles.ejemploDatos}>
        <Text style={styles.ejemploTitulo} numberOfLines={1}>{objeto.titulo}</Text>
        <Text style={styles.ejemploLugar} numberOfLines={1}>{objeto.zona} · {objeto.lugar}</Text>
        <View style={[styles.insignia, { backgroundColor: encontrado ? tema.encontrado : tema.perdido }]}>
          <Text style={[styles.insigniaTexto, { color: encontrado ? tema.verdeOscuro : tema.terracota }]}>{encontrado ? 'Encontrado' : 'Perdido'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function InicioWeb() {
  const { usuario, cargando } = useAuth();
  const { objetos } = usePublicaciones();
  const [verCatalogo, setVerCatalogo] = useState(false);
  const { width } = useWindowDimensions();
  const horizontal = width >= 850;

  if (usuario || verCatalogo) return <CatalogoWeb />;

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.cabecera}>
        <View style={styles.cabeceraInterior}>
          <Marca />
          <View style={styles.navegacion}>
            <Link href={{ pathname: '/cuenta', params: { modo: 'ingresar' } }} asChild>
              <Pressable accessibilityRole="button" style={styles.botonClaro}><Text style={styles.botonClaroTexto}>Iniciar sesión</Text></Pressable>
            </Link>
            <Link href={{ pathname: '/cuenta', params: { modo: 'registrar' } }} asChild>
              <Pressable accessibilityRole="button" style={styles.botonVerde}><Text style={styles.botonVerdeTexto}>Registrarme</Text></Pressable>
            </Link>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, !horizontal && styles.heroCompacto]}>
          <View style={styles.heroTexto}>
            <Text accessibilityRole="header" style={[styles.titulo, !horizontal && styles.tituloCompacto]}>Lo que perdiste,{"\n"}alguien lo encontró.</Text>
            <Text style={styles.descripcion}>Publica objetos perdidos o encontrados en tu universidad, centro comercial o comunidad.</Text>
            <View style={styles.cta}>
              <Link href={{ pathname: '/cuenta', params: { modo: 'registrar' } }} asChild>
                <Pressable accessibilityRole="button" style={styles.botonVerde}><Text style={styles.botonVerdeTexto}>Registrarme</Text></Pressable>
              </Link>
              <Pressable accessibilityRole="button" onPress={() => setVerCatalogo(true)} style={styles.botonClaro}><Text style={styles.botonClaroTexto}>Ver objetos recientes</Text></Pressable>
            </View>
          </View>
          <View style={styles.listaEjemplos}>
            {cargando ? Array.from({ length: 3 }, (_, i) => <SkeletonObjeto key={i} compacto />) : objetos.slice(0, 3).map((item) => <Ejemplo key={item.id} objeto={item} onPress={() => setVerCatalogo(true)} />)}
          </View>
        </View>
        <View style={styles.seccion}>
          <Text accessibilityRole="header" style={styles.seccionTitulo}>Cómo funciona</Text>
          <View style={[styles.pasos, !horizontal && styles.pasosColumna]}>
            {[['1', 'Publica', 'Sube una foto y elige el lugar y la zona exacta.'], ['2', 'Busca', 'Filtra por lugar, tipo y categoría.'], ['3', 'Reclama', 'Envía una solicitud de recuperación y coordina la entrega.']].map(([n, titulo, detalle]) => (
              <View key={n} style={styles.paso}>
                <View style={styles.numero}><Text style={styles.numeroTexto}>{n}</Text></View>
                <Text style={styles.pasoTitulo}>{titulo}</Text>
                <Text style={styles.pasoDetalle}>{detalle}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: tema.fondo },
  cabecera: { borderBottomWidth: 1, borderBottomColor: tema.borde },
  cabeceraInterior: { maxWidth: 1350, width: '100%', alignSelf: 'center', minHeight: 80, paddingHorizontal: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  marca: { fontSize: 30, fontWeight: '800', letterSpacing: -1.2, fontFamily: tipografia.enfasis },
  navegacion: { flexDirection: 'row', gap: 10 },
  botonClaro: { borderRadius: 11, backgroundColor: tema.fondo, borderWidth: 1, borderColor: tema.borde, minHeight: 44, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' },
  botonClaroTexto: { color: tema.texto, fontWeight: '700', fontSize: 14 },
  botonVerde: { backgroundColor: tema.verde, minHeight: 44, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center', borderRadius: 11 },
  botonVerdeTexto: { color: tema.panel, fontWeight: '800', fontSize: 14 },
  scroll: { maxWidth: 1300, width: '100%', alignSelf: 'center', paddingHorizontal: 28, paddingBottom: 64 },
  hero: { paddingTop: 78, paddingBottom: 88, flexDirection: 'row', alignItems: 'center', gap: 66 },
  heroCompacto: { flexDirection: 'column', alignItems: 'stretch', gap: 40, paddingTop: 56, paddingBottom: 55 },
  heroTexto: { flex: 1, gap: 20 },
  titulo: { fontSize: 59, lineHeight: 66, fontWeight: '800', color: tema.texto, letterSpacing: -2.2, fontFamily: tipografia.enfasis },
  tituloCompacto: { fontSize: 39, lineHeight: 46 },
  descripcion: { color: tema.secundario, fontSize: 17, lineHeight: 25, maxWidth: 510 },
  cta: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 7 },
  listaEjemplos: { flex: 1, gap: 12 },
  ejemplo: { backgroundColor: tema.panel, borderColor: tema.borde, borderWidth: 1, borderRadius: 14, padding: 10, gap: 14, flexDirection: 'row', alignItems: 'center' },
  iconoFondo: { width: 58, height: 58, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  icono: { fontSize: 27 },
  ejemploDatos: { flex: 1, gap: 5 },
  ejemploTitulo: { fontWeight: '800', color: tema.texto, fontSize: 15 },
  ejemploLugar: { color: tema.secundario, fontSize: 12 },
  insignia: { borderRadius: 30, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  insigniaTexto: { fontSize: 10, fontWeight: '700' },
  seccion: { gap: 20, paddingTop: 12 },
  seccionTitulo: { color: tema.texto, fontSize: 27, fontWeight: '800', letterSpacing: -0.6 },
  pasos: { flexDirection: 'row', gap: 15 },
  pasosColumna: { flexDirection: 'column' },
  paso: { flex: 1, minWidth: 0, backgroundColor: tema.panel, borderColor: tema.borde, borderWidth: 1, borderRadius: 14, padding: 21, gap: 10 },
  numero: { width: 28, height: 28, borderRadius: 15, backgroundColor: tema.encontrado, alignItems: 'center', justifyContent: 'center' },
  numeroTexto: { fontWeight: '800', color: tema.verde },
  pasoTitulo: { color: tema.texto, fontWeight: '800', fontSize: 18 },
  pasoDetalle: { color: tema.secundario, fontSize: 14, lineHeight: 21 },
});
